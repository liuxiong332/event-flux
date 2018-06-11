import AppStore from '../../event-flux/AppStore';
const { ipcRenderer, remote } = require('electron');
const { globalName } = require('./constants');

function storeEnhancer() {
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

  const forwarder = ({ type, payload }) => {
    // Forward all actions to the listening renderers
    for (let webContentsId in clients) {
      if (!clients[webContentsId].active) continue;
      if (clients[webContentsId].clientId === context.flags.senderClientId) continue;

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

      const action = { type, payload: { updated, deleted } };
      webContents.send(`${globalName}-browser-dispatch`, JSON.stringify(action));
    }
  };
}
class MultiWindowAppStore extends AppStore {
  init() {
    super.init();
  }
}