module.exports = class ModelBase {
  constructor(reeventApp) {
    this.reeventApp = reeventApp;
    this._listeners = [];
    this.state = {};
    this._disposables = [];
    this.onStateChange = this.onStateChange.bind(this);
  }

  addDisposable(disposable) {
    this._disposables.push(disposable);
  }

  onStateChange(state) {
    this.setState(state);
  }

  addStateChange(callback) {
    this._listeners.push(callback);
    return () => {
      const index = this._listeners.indexOf(callback);
      if (index !== -1) {
        this._listeners.splice(index, 1);
      }
    };
  }

  observeState(callback) {
    let disposable = this.addStateChange(callback);
    this.forceUpdate();
    return disposable;
  }

  addStoreStateChange(store, callback) {
    let disposable = store.addStateChange(callback || this.onStateChange);
    this.addDisposable(disposable);
    return disposable;
  }

  observeStore(store, callback) {
    let disposable = store.observeState(callback || this.onStateChange);
    this.addDisposable(disposable);
    return disposable;
  }

  forceUpdate() {
    let listeners = this._listeners;
    let length = listeners.length;
    for (let i = 0; i < length; ++i) {
      listeners[i](this.state);
    }
  }

  setState(state) {
    if (state && Object.keys(state).length > 0) {
      Object.assign(this.state, state);
      this.forceUpdate();
    }
  }

  dispose() {
    this._listeners = [];
    for (let disposable of this._disposables) {
      disposable();
    }
  }
}
