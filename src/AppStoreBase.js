import { Emitter } from 'event-kit';
import StoreBase from './StoreBase';
import BatchUpdateHost from './BatchUpdateHost';

export default class AppStoreBase {
  constructor() {
    this._enableUpdate = true;
    this._needUpdate = false;
    this._init = false;
    this.emitter = new Emitter();  
    this.batchUpdater = new BatchUpdateHost(this);  
    this.state = {};
  }

  onDidUpdate(callback) {
    return this.emitter.on('did-update', callback);
  }

  observe(callback) {
    callback(this.state);
    return this.emitter.on('did-update', callback);
  }

  onUpdateState = (state) => {
    this.state = { ...this.state, ...state };
    if (this._enableUpdate) {
      this.emitter.emit('did-update', this.state);
    } else {
      this._needUpdate = true;
    }
  };

  // Add new sub Store，put into this
  addSubStore(stateName, subStore) {
    subStore.initInClient();
    subStore.observeState((state) => this.setState({ [stateName]: state }));    
    this[`${stateName}Store`] = subStore;
  }

  setState(state) {
    if (!this._init) {  // 未初始化完成
      Object.assign(this.state, state);
    } else {
      this.state = { ...this.state, ...state };
      if (this._enableUpdate) {
        this.emitter.emit('did-update', this.state);
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
      this.emitter.emit('did-update', this.state);
    }
  }

  loadInClient(history) {
    this.initInClient && this.initInClient(history);
    this._init = true;
    return this;
  }

  loadInServer(req, history) {
    this.initInServer && this.initInServer(history);
    this._init = true;
    return this;
  } 

  dispose() {
    this.emitter.dispose();
    for (var key in this) {
      let store = this[key];
      if (store instanceof StoreBase) {
        store.dispose();
        this[key] = null;
      }
    }
  }
}
