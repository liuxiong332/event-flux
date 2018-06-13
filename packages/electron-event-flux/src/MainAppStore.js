import AppStore from '../../event-flux/src/AppStore';
const { ipcMain } = require('electron');
const { globalName } = require('./constants');
const objectDifference = require('./utils/object-difference');
const isEmpty = require('lodash/isEmpty');

function storeEnhancer(appStore, stores) {
  let clients = {}; // webContentsId -> {webContents, filter, clientId, windowId, active}

  // Need to keep track of windows, as when a window refreshes it creates a new
  // webContents, and the old one must be unregistered
  let windowMap = {}; // windowId -> webContentsId

  // Cannot delete data, as events could still be sent after close
  // events when a BrowserWindow is created using remote
  let unregisterRenderer = (webContentsId) => {
    clients[webContentsId] = { active: false };
  };

  ipcMain.on(`${globalName}-register-renderer`, ({ sender }, { filter, clientId }) => {
    let webContentsId = sender.getId();
    clients[webContentsId] = {
      webContents: sender,
      filter,
      clientId,
      windowId: sender.getOwnerBrowserWindow().id,
      active: true
    };

    if (!sender.isGuest()) { // For windowMap (not webviews)
      let browserWindow = sender.getOwnerBrowserWindow();
      if (windowMap[browserWindow.id] !== undefined) { // Occurs on window reload
        unregisterRenderer(windowMap[browserWindow.id]);
      }
      windowMap[browserWindow.id] = webContentsId;

      // Webcontents aren't automatically destroyed on window close
      browserWindow.on('closed', () => unregisterRenderer(webContentsId));
    }
  });

  const forwarder = (payload) => {
    // Forward all actions to the listening renderers
    for (let webContentsId in clients) {
      if (!clients[webContentsId].active) continue;

      let webContents = clients[webContentsId].webContents;

      if (webContents.isDestroyed() || webContents.isCrashed()) {
        unregisterRenderer(webContentsId);
        continue;
      }

      let shape = clients[webContentsId].filter;
      let updated = fillShape(payload.updated, shape);
      let deleted = fillShape(payload.deleted, shape);

      if (isEmpty(updated) && isEmpty(deleted)) {
        continue;
      }

      const action = { payload: { updated, deleted } };
      webContents.send(`${globalName}-browser-dispatch`, JSON.stringify(action));
    }
  };

  // Give renderers a way to sync the current state of the store, but be sure we don't
  // expose any remote objects. In other words, we need to rely exclusively on primitive
  // data types, Arrays, or Buffers. Refer to:
  // https://github.com/electron/electron/blob/master/docs/api/remote.md#remote-objects
  global[globalName] = () => JSON.stringify(appStore.state);

  const storeNames = Object.keys(stores);
  global[globalName + 'Stores'] = () => storeNames;

  ipcMain.on(`${globalName}-renderer-dispatch`, (event, clientId, stringifiedAction) => {
    const { store, method, args } = JSON.parse(stringifiedAction);
    stores[store][method].apply(stores[store], args);
  });
  return forwarder;
}

export default class MultiWindowAppStore extends AppStore {
  onWillChange(prevState, state) {
    const delta = objectDifference(prevState, state);
    if (isEmpty(delta.updated) && isEmpty(delta.deleted)) return;
    this.forwarder(delta);
  };

  init() {
    super.init();
    this.forwarder = storeEnhancer(this, this.stores);
  }
}