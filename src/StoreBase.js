const { Emitter, Disposable, CompositeDisposable } = require('event-kit');

module.exports = class ModelBase {
  constructor(reeventApp) {
    this.reeventApp = reeventApp;
    this.state = {};
    this.onStateChange = this.onStateChange.bind(this);
    this._emitter = new Emitter();
    this._disposables = new CompositeDisposable();
  }

  addDisposable(disposable) {
    this._disposables.add(disposable);
  }

  onStateChange(state) {
    this.setState(state);
  }

  addStateChange(callback) {
    return this._emitter.on('changeState', callback);
  }

  addEventCallback(event, callback) {
    return this._emitter.on(event, callback);
  }

  observeState(callback) {
    let disposable = this.addStateChange(callback);
    this._emitter.emit('changeState', this.state);
    return disposable;
  }

  addStoreStateChange(store, callback) {
    let disposable = store.addStateChange(callback || this.onStateChange);
    this.addDisposable(disposable);
    return disposable;
  }

  addStoreEvent(store, event, callback) {
    let disposable = store._emitter.on(event, callback);
    this.addDisposable(disposable);
    return disposable;
  }

  observeStore(store, callback) {
    let disposable = store.observeState(callback || this.onStateChange);
    this.addDisposable(disposable);
    return disposable;
  }

  setState(state) {
    if (state && Object.keys(state).length > 0) {
      Object.assign(this.state, state);
      this._emitter.emit('changeState', this.state);
    }
  }

  emitEvent(event, value) {
    this._emitter.emit(event, value);
  }

  dispose() {
    this.emitter.dispose();
  }
}
