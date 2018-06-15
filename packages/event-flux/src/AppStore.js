import { Emitter } from 'event-kit';
import StoreBase from './StoreBase';
import BatchUpdateHost from './BatchUpdateHost';
import { findInList } from './utils';
import { parseStore, injectDependencies, getStoreKey, getStateKey } from './buildStore';

export function parseStores(storeList) {
  let stores = {};
  if (!storeList) return stores;
  storeList.forEach(store => {
    let resStore = parseStore(store);
    if (resStore) {
      let storeKey = getStoreKey(resStore.constructor);
      if (stores[storeKey]) console.error('The store ' + storeKey + ' has existed');
      stores[storeKey] = resStore;
    };
  });
  return stores;
}

export default class AppStore {
  constructor(stores = [], onChange) {
    this._enableUpdate = true;  // 是否可以更新
    this._needUpdate = false;   // 是否需要更新
    this._init = false;         // 是否已经初始化
    this.onChange = onChange;
    this.batchUpdater = new BatchUpdateHost(this);  
    this.state = {};
    this.stores = parseStores(stores);
    this.observeStores();
    this.injectStores();
  }

  injectStores() {
    let stores = this.stores;
    for (let key in stores) {
      let store = stores[key];
      store.batchUpdater = this.batchUpdater;
      store._appStore = this;
      injectDependencies(this, store);
    }
  }

  observeStores() {
    let stores = this.stores;
    for (let key in stores) {
      let store = stores[key];
      store.observe((state) => {
        let key = getStateKey(store.constructor);
        this.setState({ [key]: state });
      });
    }
  }

  setState(state) {
    if (!this._init) {  // 未初始化完成
      Object.assign(this.state, state);
    } else {
      this.state = { ...this.state, ...state };
      if (this._enableUpdate) {
        this._sendUpdate();
      } else {
        this._needUpdate = true;
      }
    }
  }

  disableUpdate() {
    this._enableUpdate = false;
  }

  enableUpdate() {
    this._enableUpdate = true;
    if (this._needUpdate) {
      this._sendUpdate();
    }
  }

  sendUpdate() {
    if (!this._init) return;
    if (this._enableUpdate) {
      this._sendUpdate();
    } else {
      this._needUpdate = true;
    }
  }

  _sendUpdate() {
    this.onWillChange && this.onWillChange(this.prevState, this.state);
    this.onChange && this.onChange(this.state);
    this.prevState = this.state;
  }

  init() {
    let stores = this.stores;
    for (let key in stores) {
      stores[key]._initWrap();
    }
    this._init = true;    
    this.prevState = this.state;
    return this;
  }

  dispose() {
    for (var key in this.stores) {
      let store = this[key];
      if (store instanceof StoreBase) {
        store.dispose();
        this[key] = null;
      }
    }
  }
}
