import { Emitter } from 'event-kit';
const omit = require('lodash/omit');

export const addStateFilter = (StoreClass) => {
  return class MainStoreBase extends StoreClass {
    _stateListeners = {};
    _stateFilters = {};

    appStores: any;
    static innerStores;
    
    constructor(...args) {
      super(...args);
    }

    getDefaultFilter() {
      if (this.options && this.options.defaultFilter) return { '*': true };
      return { '*': false };
    }

    initStateFilters() {
      const initForClientId = (clientId) => {
        let clientFilters = this.getDefaultFilter();
        this.getSubStoreInfos && this.getSubStoreInfos().forEach((storeInfo) => {
          let storeName = storeInfo[2]; 
          let stateKey = storeInfo[3];
          let subStore = this.getStore ? this.getStore(storeName) : this[storeName];
          let storeFilter = subStore._stateFilters && subStore._stateFilters[clientId] || { '*': true };
          if (stateKey) {
            clientFilters[stateKey] = storeFilter;
          } else {
            clientFilters = Object.assign(clientFilters, omit(storeFilter, '*'));
          }
        });
        this._stateFilters[clientId] = clientFilters;
      };
      let winManagerStore = (this.appStores || this.stores).winManagerStore;
      winManagerStore.getClienIds().forEach(initForClientId);
      winManagerStore.onDidAddWin(initForClientId);
      winManagerStore.onDidRemoveWin((clientId) => this._stateFilters[clientId] = null);

      this.getSubStoreInfos && this.getSubStoreInfos().forEach((storeInfo) => {
        let storeName = storeInfo[2]; 
        let stateKey = storeInfo[3];
        let subStore = this.getStore ? this.getStore(storeName) : this[storeName];
        subStore.emitter.on('did-filter-update', ({ clientId, filters }) => {
          if (stateKey) {
            this._setFilter(clientId, { [stateKey]: filters })
          } else {
            this._setFilter(clientId, omit(filters, '*'));
          }
        });
      });
    }

    _initWrap() {
      this.initStateFilters();
      super._initWrap();
    }

    _setFilter(clientId, newFilter) {
      const filterRunner = () => {
        let oldFilters = this._stateFilters[clientId] || this.getDefaultFilter();
        let nextFilters = { ...oldFilters, ...newFilter }; 
        this._stateFilters[clientId] = nextFilters;
        this.emitter && this.emitter.emit('did-filter-update', { clientId, filters: nextFilters });
      };
      this.batchUpdater ? this.batchUpdater.addTask(filterRunner) : filterRunner();
    }

    listen = function(clientId: string) {
      if (!clientId) return console.error('The clientId is not specify');
      let _stateListeners = this._stateListeners;
      if (_stateListeners[clientId] == null) _stateListeners[clientId] = 0;
      _stateListeners[clientId] += 1;
      if (_stateListeners[clientId] === 1) {
        this._setFilter(clientId, { '*': true });
      }
    }
  
    unlisten = function(clientId: string) {
      if (!clientId) return console.error('The clientId is not specify');
      let _stateListeners = this._stateListeners;
      _stateListeners[clientId] -= 1;
      if (_stateListeners[clientId] === 0) {
        this._setFilter(clientId, { '*': false });
      }
    };
  }
}

type KeyType = string | number | string[] | number[];
export const addStateFilterForMap = (StoreClass) => {
  return class MainStoreBase extends StoreClass {
    _stateListeners = {};
    _stateFilters = {};
    _filterDisposables = {};
  
    constructor(...args) {
      super(...args);
    }

    getDefaultFilter() {
      // defaultFilter=true 表示默认的*为true，并且将observe所有key
      if (this.options && this.options.defaultFilter) return { '*': true };
      return { '*': false };
    }

    initStateFilters() {
      let defaultFilter = this.options && this.options.defaultFilter;
      const initForClientId = (clientId) => {
        let clientFilters = this.getDefaultFilter();
        if (defaultFilter) {
          let entries = this.storeMap.entries(); 
          for (let [key, store] of entries) {
            clientFilters[key] = store._stateFilters && store._stateFilters[clientId] || { '*': true };
          }
        }
        this._stateFilters[clientId] = clientFilters; 
      };
      let winManagerStore = this.appStores.winManagerStore;
      winManagerStore.getClienIds().forEach(initForClientId);
      winManagerStore.onDidAddWin(initForClientId);
      winManagerStore.onDidRemoveWin((clientId) => this._stateFilters[clientId] = null);

      if (defaultFilter) {
        for (let [key, store] of this.storeMap.entries()) {
          // clientFilters[key] = defaultFilter ? store._stateFilters && store._stateFilters[clientId] || { '*': true } : { '*': false };
          this._filterDisposables[key] = store.emitter.on('did-filter-update', ({ clientId, filters }) => {
            this._setFilter(clientId, { [key]: filters })
          });
        }
      }
    }

    _initWrap() {
      this.initStateFilters();
      super._initWrap();
    }

    _setFilter(clientId, newFilter) {
      let oldFilters = this._stateFilters[clientId] || this.getDefaultFilter();
      let nextFilters = { ...oldFilters, ...newFilter }; 
      this._stateFilters[clientId] = nextFilters;
      this.emitter.emit('did-filter-update', { clientId, filters: nextFilters});
    }

    listenForKeys = function(clientId: string, key: KeyType) {
      if (!clientId) return console.error('The clientId is not specify');
      let keys = Array.isArray(key) ? key : [key];
      let _stateListeners = this._stateListeners;
      keys.forEach(key => {
        let saveKey = clientId + key;
        if (_stateListeners[saveKey] == null) _stateListeners[saveKey] = 0;
        _stateListeners[saveKey] += 1;
        if (_stateListeners[saveKey] === 1) {
          let store = this.storeMap.get(key);
          let storeFilter = store._stateFilters && store._stateFilters[clientId] || { '*': true };
          this._setFilter(clientId, { [key]: storeFilter });
          this._filterDisposables[key] = store.emitter.on('did-filter-update', ({ clientId, filters }) => {
            this._setFilter(clientId, { [key]: filters });
          });
        }
      });
    }
  
    unlistenForKeys = function(clientId: string, key: KeyType) {
      if (!clientId) return console.error('The clientId is not specify');
      let keys = Array.isArray(key) ? key : [key];
      let _stateListeners = this._stateListeners;
      keys.forEach(key => {
        let saveKey = clientId + key;
        _stateListeners[saveKey] -= 1;
        if (_stateListeners[saveKey] === 0) {
          this._setFilter(clientId, { [key]: false });
          this._filterDisposables[key].dispose();
        }
      });
    };

    add(key, prevInit) {
      let newStore = super.add(key, prevInit);
      let defaultFilter = this.options && this.options.defaultFilter;
      if (defaultFilter) {
        Object.keys(this._stateFilters).forEach(clientId => {
          let filters = newStore._stateFilters && newStore._stateFilters[clientId] || { '*': true };
          this._setFilter(clientId, { [key]: filters });
        });
        if (this._filterDisposables[key]) console.error(`The key ${key} should NOT add twice`);
        this._filterDisposables[key] = newStore.emitter.on('did-filter-update', ({ clientId, filters }) => {
          this._setFilter(clientId, { [key]: filters });
        });
      }
      return newStore;
    }

    deleteFilter(key) {
      let store = this.storeMap.get(key);
      Object.keys(this._stateFilters).forEach(clientId => {
        this._setFilter(clientId, { [key]: null });
      });
      if (this._filterDisposables[key]) {
        this._filterDisposables[key].dispose();
        this._filterDisposables[key] = null;
      }
    }

    delete(key) {
      this.deleteFilter(key);  
      super.delete(key);
    }

    clear() {
      let keys = this.storeMap.keys();
      for (let key of keys) {
        this.deleteFilter(key);
      }
      super.clear();
    }

    dispose() {
      super.dispose();
      for (let key in this._filterDisposables) {
        let disposable = this._filterDisposables[key];
        disposable && disposable.dispose();
      }
    }
  }
}