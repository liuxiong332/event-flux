module.exports = class ModelBase {
  constructor() {
    this._listeners = [];
    this.state = {};
    this.disposables = [];
  }

  addStateChange(callback) {
    this._listeners.push(callback);
    return () => {
      const index = this._listeners.indexOf(callback);
      if (index !== -1) {
        this._listeners.splice(index, 1)
      }
    };
  }

  addDisposable(disposable) {
    this.disposables.push(disposable);
  }

  observeState(callback) {
    let disposable = this.addStateChange(callback);
    this.forceUpdate();
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
    this._listeners = null;
    for (let disposable of this.disposables) {
      disposable();
    }
  }
}
