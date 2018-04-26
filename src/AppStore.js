import { Emitter } from 'event-kit';
import StoreBase from './StoreBase';
import BatchUpdateHost from './BatchUpdateHost';
import { findInList, injectDependencies } from './utils';

const StoreExp = /Store/;
export default class AppStore {
  constructor(stores, onChange) {
    this._enableUpdate = true;  // 是否可以更新
    this._needUpdate = false;   // 是否需要更新
    this._init = false;         // 是否已经初始化
    this.onChange = onChange;
    this.batchUpdater = new BatchUpdateHost(this);  
    this.state = {};
    this.stores = stores;
    this.observeStores();
    this.injectStores();
  }

  parseStore(store) {
    if (store instanceof StoreBase) {
      return store;
    } else if (StoreExp.test(store)) {
      return new store();
    } else {
      console.error('The store you specific must be Store instance or Store class');
      return null;
    }
  }

  parseStores(storeList) {
    stores = {};
    storeList.forEach(store => {
      let resStore = this.parseStore(store);
      if (resStore) {
        stores[resStore.constructor.getStoreKey()] = resStore;
      };
    });
  }

  injectStores() {
    this.stores.forEach(store => {
      store.batchUpdater = this.batchUpdater;
      store._appStore = this._appStore;
      injectDependencies(this, store);
    });
  }

  observeStores() {
    this.stores.forEach(store => {
      store.observeState((state) => {
        let key = store.constructor.getStateKey();
        this.setState({ [key]: state });
      });
    });
  }

  onUpdateState = (state) => {
    this.state = { ...this.state, ...state };
    if (this._enableUpdate) {
      // this.emitter.emit('did-update', this.state);
      this.onChange(this.state);
    } else {
      this._needUpdate = true;
    }
  };

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
    this.stores.forEach(store => {
      store.init && store.init();
    });
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
