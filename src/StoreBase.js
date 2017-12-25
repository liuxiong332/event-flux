import { Emitter } from 'event-kit';

export default class StoreBase {
  constructor(appStore) {
    this.appStore = appStore;
    this.state = {};
    this.emitter = new Emitter();
    this.inWillUpdate = false;
    this.willUpdateStates = [];
  }

  setState(state) {
    // 当will-update，将状态保存到缓存队列中
    if (this.inWillUpdate) {
      return this.willUpdateStates.push(state);
    }
    // Make the update delay to next tick that can collect many update into one operation.
    this.appStore.batchUpdater.addTask(() => {
      let nextState = { ...this.state, ...state }; 
      this.inWillUpdate = true;   
      this.emitter.emit('will-update', nextState);
      this.inWillUpdate = false;
      if (this.willUpdateStates.length > 0) {
        this.state = this.willUpdateStates.reduce((allState, state) => Object.assign(allState, state), nextState);
        this.willUpdateStates = [];
      } else {
        this.state = nextState;
      }
      this.emitter.emit('did-update', this.state);
    });
    // this.emitter.emit('did-update', this.state);
  }

  onDidUpdate(callback) {
    return this.emitter.on('did-update', callback);
  }

  onWillUpdate(callback) {
    return this.emitter.on('will-update', callback);    
  }

  observeState(callback) {
    callback(this.state);
    return this.emitter.on('did-update', callback);    
  }

  dispose() {
    this.emitter.dispose();
  }

  getState() {
    return this.state;
  }
}