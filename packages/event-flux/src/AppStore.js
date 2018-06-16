import StoreBase from './StoreBase';
import BatchUpdateHost from './BatchUpdateHost';
import { buildStore } from './buildStore';

const IS_APP_STORE = '@@__APP_STORE__@@';

export default class AppStore {
  constructor(onChange) {
    this._enableUpdate = true;  // 是否可以更新
    this._needUpdate = false;   // 是否需要更新
    this._init = false;         // 是否已经初始化
    this.onChange = onChange;
    this.batchUpdater = new BatchUpdateHost(this);  
    this.state = {};
    this.stores = {};
  }

  buildStore(storeClass) {
    return buildStore(this, storeClass);
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