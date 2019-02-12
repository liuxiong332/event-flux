export const addStateFilter = (StoreClass) => {
  return class MainStoreBase extends StoreClass {
    _stateListeners = {};
    _stateFilters = { '*': false };
  
    constructor(...args) {
      super(...args);
    }
    
    initStateFilters() {
      let _stateFilters = { '*': false };
      this.getSubStoreInfos().forEach(([type, Store, storeName, stateKey]) => {
        _stateFilters[stateKey] = this[storeName]._stateFilters || { '*': true };
      });
      this._stateFilters = _stateFilters;
    }

    _initWrap() {
      this.initStateFilters();
      super._initWrap();
    }

    listen = function(clientId: string) {
      if (!clientId) return console.error('The clientId is not specify');
      let _stateListeners = this._stateListeners;
      if (_stateListeners[clientId] == null) _stateListeners[clientId] = 0;
      _stateListeners[clientId] += 1;
      if (_stateListeners[clientId] === 1) {
        this._stateFilters['*'] = true;
      }
    }
  
    unlisten = function(clientId: string) {
      if (!clientId) return console.error('The clientId is not specify');
      let _stateListeners = this._stateListeners;
      _stateListeners[clientId] -= 1;
      if (_stateListeners[clientId] === 0) {
        this._stateFilters['*'] = false;
      }
    };
  }
}

type KeyType = string | number | string[] | number[];
export const addStateFilterForMap = (StoreClass) => {
  return class MainStoreBase extends StoreClass {
    _stateListeners = {};
    _stateFilters = { '*': false };
  
    constructor(...args) {
      super(...args);
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
          this._stateFilters[key] = this.storeMap.get(key)._stateFilters || { '*': true };
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
          this._stateFilters[key] = false;
        }
      });
    };
  }
}