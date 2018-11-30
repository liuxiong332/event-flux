import StoreBase from './StoreBase';
import BatchUpdateHost from './BatchUpdateHost';
import { buildStore } from './buildStore';

const IS_APP_STORE = '@@__APP_STORE__@@';

export default class AppStore {
  _enableUpdate = true;  // 是否可以更新
  _needUpdate = false;   // 是否需要更新
  _init = false;         // 是否已经初始化
  onChange: any;

  batchUpdater: BatchUpdateHost;
  prevState = {};
  state = {};
  stores = {};

  static isAppStore;
  
  constructor(onChange) {
    this.onChange = onChange;
    this.batchUpdater = new BatchUpdateHost(this);  
  }

  buildStore(storeClass, args) {
    return buildStore(this, storeClass, args);
  }

  setState(state) {
    if (!this._init) {  // 未初始化完成
      (Object as any).assign(this.state, state);
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

  onWillChange(prevState, state) {}
  
  init() {
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

AppStore.prototype[IS_APP_STORE] = true;
AppStore.isAppStore = function(maybeAppStore) {
  return !!(maybeAppStore && maybeAppStore[IS_APP_STORE]);
}