import { Emitter } from 'event-kit';
import StoreBase from './StoreBase';
import BatchUpdateHost from './BatchUpdateHost';
import { findInList } from './utils';
import { parseStore, injectDependencies } from './buildStore';

export function parseStores(storeList) {
  let stores = {};
  storeList.forEach(store => {
    let resStore = parseStore(store);
    if (resStore) {
      stores[resStore.getStoreKey()] = resStore;
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
      store._appStore = this._appStore;
      injectDependencies(this, store);
    }
  }

  observeStores() {
    let stores = this.stores;
    for (let key in stores) {
      let store = stores[key];
      store.observe((state) => {
        let key = store.getStateKey();
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
        this.onChange(this.state);
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
      this.onChange(this.state);
    }
  }

  init() {
    this._init = true;    
    let stores = this.stores;
    for (let key in stores) {
      stores[key]._initWrap();
    }
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
