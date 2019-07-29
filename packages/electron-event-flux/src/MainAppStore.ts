import AppStore from 'event-flux/lib/AppStore';
import objectDifference from './utils/objectDifference';
import filterDifference from './utils/filterDifference';
import filterApply from './utils/filterApply';
import { filterOneStore } from './utils/filterStore';
import { filterWindowStore, filterWindowState, filterWindowDelta } from './utils/filterWindowStore';
import { declareStore, StoreDeclarer, StoreListDeclarer, StoreMapDeclarer } from './StoreDeclarer';
import MainClient from './MainClient';
import MultiWinManagerStore, { WinPackStore } from './MultiWinManagerStore';
import ActionRecordStore from './ActionRecordStore';
import MultiWinStore from './MultiWinStore';
import { addStateFilter } from './utils/stateFilterDecorator';
import loggerApply, { Log, Logger } from './utils/loggerApply';

import { isEmpty, isObject } from './utils/objUtils';
import { winManagerStoreName, winManagerKey } from './constants';
import { serialize, deserialize } from 'json-immutable-bn';
import StoreBase from 'event-flux/lib/StoreBase';

function findStore(stores, storePath) {
  if (!storePath) return;
  return storePath.reduce((subStores, entry) => {
    if (!subStores) return undefined;
    if (!isObject(entry)) return subStores[entry];    
    let { name, type, index } = entry;
    let storeCol = subStores[name];
    if (type === 'List' || type === 'Map') {
      return storeCol.get(index);
    }
  }, stores);
}

function storeEnhancer(appStore: MultiWindowAppStore, stores, storeShape, log: Log) {
  const callbacks = {
    addWin(clientId) {
      stores[winManagerStoreName].addWin(clientId);
    },
    deleteWin(clientId) {
      stores[winManagerStoreName].deleteWin(clientId);
    },
    getStores(clientId, filter) {
      let stores = filterWindowStore(storeShape, winManagerStoreName, clientId);
      return JSON.stringify(stores);
    },
    getInitStates(clientId, filter) {
      if (process.env.NODE_ENV === 'development') {
        if (!appStore._prevStateFilters || !appStore._prevStateFilters[clientId]) {
          console.error('The filter should has init, If not, then should has a bug!');
        }
        if (appStore._prevStateFilters !== appStore._stateFilters) {
          console.error('The state filters should has update before get initial states!');
        }
        if (appStore.prevState !== appStore.state) {
          console.error('The state should has updated before get initial states!');
        }
      }
      
      let updateState = filterApply(appStore.prevState, appStore._prevStateFilters[clientId], null);
      let filterState = filterWindowState(updateState, winManagerKey, clientId);
      return serialize(filterState);
    },
    handleRendererMessage(payload) {
      try {
        const { store: storePath, method, args } = deserialize(payload);
        let store = findStore(stores, storePath);

        if (!store) {
          throw new Error(`The store for method ${method} is not defined`);
        }
        if (!store[method]) {
          throw new Error(`The method ${method} in Store ${store} is not defined`);
        }
        let result = store[method].apply(store, args);
        return Promise.resolve(result);
      } catch (err) {
        return Promise.reject(err);
      }
    }
  }
  
  const mainClient = new MainClient(callbacks, log);
  appStore.mainClient = mainClient;
  const forwarder = (prevState, state, prevFilters, filters) => {
    // Forward all actions to the listening renderers
    let clientInfo = mainClient.getForwardClients();

    if (clientInfo.length === 0) return;

    clientInfo.forEach(client => {
      let clientId = client.clientId;
      if (prevFilters[clientId] !== filters[clientId]) {
        let { updated, deleted } = filterDifference(prevFilters[clientId], filters[clientId]);
        let updateState = filterApply(state, updated, deleted);
        
        updateState = filterWindowState(updateState, winManagerKey, clientId);
        if (isEmpty(updateState)) return;
        mainClient.sendToRenderer(client, serialize({ payload: { updated: updateState } }));
      }
    });

    const delta = objectDifference(prevState, state);
    if (isEmpty(delta.updated) && isEmpty(delta.deleted)) return;
   
    clientInfo.forEach(client => {
      let { clientId } = client;

      let filterUpdated = filterApply(delta.updated, filters[clientId], null);
      let filterDeleted = filterApply(delta.deleted, filters[clientId], null);

      let [updated, deleted] = filterWindowDelta(
        filterUpdated, filterDeleted, winManagerKey, clientId
      );

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
  storeShape: any;
  forwarder: any;
  willQuit: boolean;
  _stateFilters: any;
  _prevStateFilters: any;

  filterCallbacks = [];
  mainClient: any;
  log: Log;

  static innerStores;

  constructor(log: Log) {
    super();
    this.log = log;
  }

  init() {
    this.buildStores();
    this.initStores(this);

    this._initStateFilters();
    let winManagerStore = this.stores.winManagerStore;
    winManagerStore.onDidAddWin((clientId) => {
      this._handleAddWin(clientId);
      this._sendUpdate();
    });
    winManagerStore.onDidRemoveWin((clientId) => this._handleRemoveWin(clientId));
    this._prevStateFilters = Object.assign({}, this._stateFilters);

    this.startObserve();
    super.init();
    this.forwarder = storeEnhancer(this, this.stores, this.storeShape, this.log);
    return this;
  }

  handleWillFilterChange(prevState, state, prevFilters, filters) {
    return this.forwarder(prevState, state, prevFilters, filters);
  };

  onDidFilterChange(callback) {
    this.filterCallbacks.push(callback);
  }

  handleFilterChange() {
    this.batchUpdater.requestUpdate();
  }

  _sendUpdate() {
    this.handleWillFilterChange(this.prevState, this.state, this._prevStateFilters, this._stateFilters);
    this.didChangeCallbacks.forEach(callback => callback(this.state));
    this.prevState = this.state;
    this.filterCallbacks.forEach(callback => callback(this._stateFilters));
    this._prevStateFilters = Object.assign({}, this._stateFilters);
  }

  getStore(key) {
    return this.stores[key]
  }

  setStore(key, store) {
    return this.stores[key] = store;
  }

  getWinSpecificStore(clientId, storeName) {
    let winStores = this.stores[winManagerStoreName].winPackMap[clientId];
    if (winStores) return winStores[storeName];
  }

  // 构建子Stores
  buildStores() {}
  // 初始化子Stores
  initStores(parent) {}
  // 开始监听子Store改变
  startObserve() {}

  _initStateFilters() {}
  _handleAddWin(clientId) {}
  _handleRemoveWin(clientId) {}
}

export default function buildMultiWinAppStore(
  stores: IStoresDeclarer, 
  winStores: IStoresDeclarer, 
  { 
    WindowsManagerStore = MultiWinManagerStore, 
    ActionStore = ActionRecordStore, 
    WinHandleStore = MultiWinStore, 
  },
  logger: Logger
) {
  WinPackStore.innerStores = { ...winStores, actionRecord: ActionStore };
  let allStores = {
    ...stores, 
    multiWin: WinHandleStore,
    [winManagerKey]: declareStore(WindowsManagerStore, { storeKey: winManagerStoreName }),
  };
  let MultiWinAppStore = addStateFilter(MultiWindowAppStore);
  MultiWinAppStore.innerStores = allStores;
  const storeShape = filterOneStore(MultiWinAppStore, { applyFilter: true });
  const appStore = new MultiWinAppStore(loggerApply(logger));
  appStore.storeShape = storeShape;
  appStore.init();
  return appStore;
}