import AppStore from '../../event-flux/src/AppStore';
const { ipcMain } = require('electron');
const { globalName } = require('./constants');
const objectDifference = require('./utils/object-difference');
const fillShape = require('./utils/fill-shape');
const isEmpty = require('lodash/isEmpty');
const isObject = require('lodash/isObject');
const { serialize, deserialize } = require('json-immutable');
const { filterOneStore, filterWindowStore, filterWindowState, filterWindowDelta } = require('./utils/filter-store');
const { declareStore } = require('./StoreDeclarer');
import MultiWinManagerStore, { WinPackStore } from './MultiWinManagerStore';

function findStore(stores, storePath) {
  return storePath.reduce((subStores, entry) => {
    console.log(subStores, entry)
    if (!isObject(entry)) return subStores[entry]
    let { name, type, index } = entry;
    let storeCol = subStores[name];
    if (type === 'List' || type === 'Map') {
      return storeCol.get(index);      
    }
  }, stores);
}

const winManagerStoreName = '__WIN_MANAGER_STORE__';
const winManagerKey = '__WIN_MANAGER__';

function storeEnhancer(appStore, stores, storeShape) {
  let clients = {}; // webContentsId -> {webContents, filter, clientId, windowId, active}

  // Need to keep track of windows, as when a window refreshes it creates a new
  // webContents, and the old one must be unregistered
  let windowMap = {}; // windowId -> webContentsId

  // Cannot delete data, as events could still be sent after close
  // events when a BrowserWindow is created using remote
  let unregisterRenderer = (webContentsId) => {
    appStore.stores[winManagerStoreName].deleteWin(clients[webContentsId].clientId);
    clients[webContentsId] = { active: false };
  };

  ipcMain.on(`${globalName}-register-renderer`, ({ sender }, { filter, clientId }) => {
    let webContentsId = sender.getId();
    console.log('webcontentsid:', webContentsId)
    clients[webContentsId] = {
      webContents: sender,
      filter,
      clientId,
      windowId: sender.getOwnerBrowserWindow().id,
      active: true
    };
    appStore.stores[winManagerStoreName].addWin(clientId);

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

      let { filter: shape, clientId } = clients[webContentsId];
      let updated = fillShape(payload.updated, shape);
      let deleted = fillShape(payload.deleted, shape);
      [updated, deleted] = filterWindowDelta(updated, deleted, winManagerKey, clientId);

      if (isEmpty(updated) && isEmpty(deleted)) {
        continue;
      }

      const action = { payload: { updated, deleted } };

      const util = require('util')
      console.log(util.inspect(action, {showHidden: false, depth: null}))
      webContents.send(`${globalName}-browser-dispatch`, JSON.stringify(action));
    }
  };

  // Give renderers a way to sync the current state of the store, but be sure we don't
  // expose any remote objects. In other words, we need to rely exclusively on primitive
  // data types, Arrays, or Buffers. Refer to:
  // https://github.com/electron/electron/blob/master/docs/api/remote.md#remote-objects

  const util = require('util')
  global[globalName + 'Stores'] = (clientId) => {
    let result = filterWindowStore(storeShape, winManagerStoreName, clientId);
    
    console.log('for clientid:', util.inspect(result, {showHidden: false, depth: null}))
    return result
  }

  console.log('all state:',util.inspect(appStore.state, {showHidden: false, depth: null}))
  global[globalName] = (clientId) => {
    let filterState = filterWindowState(appStore.state, winManagerKey, clientId);
    console.log('filter state:', util.inspect(filterState, {showHidden: false, depth: null}));
    return serialize(filterState);
  }

  ipcMain.on(`${globalName}-renderer-dispatch`, (event, clientId, stringifiedAction) => {
    const { store: storePath, method, args } = deserialize(stringifiedAction);
    console.log('store path:', storePath)
    let store = findStore(stores, storePath);
    store[method].apply(store, args);
  });
  return forwarder;
}

class MultiWindowAppStore extends AppStore {
  onWillChange(prevState, state) {
    const delta = objectDifference(prevState, state);
    if (isEmpty(delta.updated) && isEmpty(delta.deleted)) return;
    this.forwarder(delta);
  };

  init() {
    this.buildStores();
    this.initStores();
    this.startObserve();
    super.init();
    this.forwarder = storeEnhancer(this, this.stores, this.storeShape);
  }

  getStore(key) {
    return this.stores[key]
  }

  setStore(key, store) {
    return this.stores[key] = store;
  }

  dispose() {
    this.disposeStores();
    super.dispose();        
  }
}

export default function buildMultiWinAppStore(stores, winStores) {
  WinPackStore.innerStores = winStores;
  let allStores = {
    ...stores, 
    [winManagerKey]: declareStore(MultiWinManagerStore, { storeKey: winManagerStoreName }),
  };
  MultiWindowAppStore.innerStores = allStores;
  const storeShape = filterOneStore(MultiWindowAppStore, (instance) => instance.stores);
  const appStore = new MultiWindowAppStore();
  appStore.storeShape = storeShape;
  appStore.init();
  return appStore;
}