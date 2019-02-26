import StoreBase from './StoreBase';
import BatchUpdateHost from './BatchUpdateHost';
import { buildStore } from './buildStore';

const IS_APP_STORE = '@@__APP_STORE__@@';

export default class AppStore {
  _init = false;
  didChangeCallbacks = [];

  batchUpdater: BatchUpdateHost;
  prevState: any = {};
  state: any = {};
  stores: any = {};

  static isAppStore;
  
  constructor() {
    this.batchUpdater = new BatchUpdateHost(this);  
  }

  buildStore(storeClass, args) {
    return buildStore(this, storeClass, args);
  }

  setState(state) {
    if (!this._init) {  // 未初始化完成
      Object.assign(this.state, state);
    } else {
      this.state = Object.assign({}, this.state, state);
      this.batchUpdater.requestUpdate();
    }
  }

  _sendUpdate() {
    this.handleWillChange && this.handleWillChange(this.prevState, this.state);
    this.didChangeCallbacks.forEach(callback => callback(this.state));
    this.prevState = this.state;
  }

  handleWillChange(prevState, state) {
  }
  
  onDidChange(callback) {
    this.didChangeCallbacks.push(callback);
  }

  init() {
    this._init = true;    
    this.prevState = this.state;
    return this;
  }

  dispose() {
    this.didChangeCallbacks = null;
    this.prevState = this.state = this.stores = null;
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