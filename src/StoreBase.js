const { Emitter, Disposable, CompositeDisposable } = require('event-kit');

module.exports = class ModelBase {
  constructor(reeventApp) {
    this.reeventApp = reeventApp;
    this.state = {};
    this.storeUpdated = this.storeUpdated.bind(this);
    this._emitter = new Emitter();
    this._disposables = new CompositeDisposable();
  }

  serialize() {
  	return this.state;
  }

  deserialize(state) {
  	this.setState(state);
  }

  addDisposable(disposable) {
    this._disposables.add(disposable);
  }

  storeUpdated(state) {
    this.setState(state);
  }

  onDidUpdate(callback) {
    return this._emitter.on('did-update', callback);
  }

  onEvent(event, callback) {
    return this._emitter.on(event, callback);
  }

  observe(callback) {
    let disposable = this.onDidUpdate(callback);
    this._emitter.emit('did-update', this.state);
    return disposable;
  }

  onDidUpdateStore(store, callback) {
    let disposable = store.onDidUpdate(callback || this.storeUpdated);
    this.addDisposable(disposable);
    return disposable;
  }

  observeStore(store, callback) {
    let disposable = store.observe(callback || this.storeUpdated);
    this.addDisposable(disposable);
    return disposable;
  }

  setState(state) {
    if (state && Object.keys(state).length > 0) {
      Object.assign(this.state, state);
      this._emitter.emit('did-update', state);
    }
  }

  emitEvent(event, value) {
    this._emitter.emit(event, value);
  }

  dispose() {
    this._emitter.dispose();
    this._disposables.dispose();
  }
}
