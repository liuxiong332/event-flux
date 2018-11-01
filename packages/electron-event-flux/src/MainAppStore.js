import AppStore from 'event-flux/lib/AppStore';
const { globalName, winManagerStoreName, winManagerKey, } = require('./constants');
const objectDifference = require('./utils/object-difference');
const fillShape = require('./utils/fill-shape');
const isEmpty = require('lodash/isEmpty');
const isObject = require('lodash/isObject');
const { serialize, deserialize } = require('json-immutable');
const { filterOneStore, filterWindowStore, filterWindowState, filterWindowDelta } = require('./utils/filter-store');
const { declareStore } = require('./StoreDeclarer');
const MainClient = require('./MainClient');
import MultiWinManagerStore, { WinPackStore } from './MultiWinManagerStore';

function findStore(stores, storePath) {
  return storePath.reduce((subStores, entry) => {
    if (!isObject(entry)) return subStores[entry]
    let { name, type, index } = entry;
    let storeCol = subStores[name];
    if (type === 'List' || type === 'Map') {
      return storeCol.get(index);      
    }
  }, stores);
}

function storeEnhancer(appStore, stores, storeShape) {
  const callbacks = {
    addWin(clientId) {
      stores[winManagerStoreName].addWin(clientId);
    },
    deleteWin(clientId) {
      stores[winManagerStoreName].deleteWin(clientId);
    },
    getStores(clientId) {
      let stores = filterWindowStore(storeShape, winManagerStoreName, clientId);
      return JSON.stringify(stores);
    },
    getInitStates(clientId) {
      let filterState = filterWindowState(appStore.state, winManagerKey, clientId);
      return serialize(filterState);
    },
    handleRendererMessage(payload) {
      const { store: storePath, method, args } = deserialize(payload);
      let store = findStore(stores, storePath);
      try {
        let result = store[method].apply(store, args);
        return Promise.resolve(result);
      } catch (err) {
        return Promise.reject(err);
      }
    }
  }
  
  const mainClient = new MainClient(callbacks);
  appStore.mainClient = mainClient;
  const forwarder = (payload) => {
    // Forward all actions to the listening renderers
    let clientInfo = mainClient.getForwardClients();
   
    clientInfo.forEach(client => {
      let { filter: shape, clientId } = client;
      let updated = fillShape(payload.updated, shape);
      let deleted = fillShape(payload.deleted, shape);
      [updated, deleted] = filterWindowDelta(updated, deleted, winManagerKey, clientId);

      if (isEmpty(updated) && isEmpty(deleted)) {
        return;
      }

      const action = { payload: { updated, deleted } };

      mainClient.sendToRenderer(client, serialize(action));
    });
  };
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
    this.initStores(this);
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

export default function buildMultiWinAppStore(stores, winStores, WindowsManagerStore = MultiWinManagerStore) {
  WinPackStore.innerStores = winStores;
  let allStores = {
    ...stores, 
    [winManagerKey]: declareStore(WindowsManagerStore, { storeKey: winManagerStoreName }),
  };
  MultiWindowAppStore.innerStores = allStores;
  const storeShape = filterOneStore(MultiWindowAppStore, (instance) => instance.stores);
  const appStore = new MultiWindowAppStore();
  appStore.storeShape = storeShape;
  appStore.init();
  return appStore;
}