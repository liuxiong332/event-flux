const { initStore, disposeStore } = require('./store-builder');

module.exports = class StoreMap {
  constructor(keys, builder, observer) {
    this.length = 0;
    this.storeMap = new Map();
    this.disposables = new Map();
    this.builder = builder;
    this.observer = observer;
    if (Array.isArray(keys)) keys.forEach(key => this.add(key));
  }

  _initWrap() {
    console.log('init wrap')
    this._isInit = true;
  }

  add(key) {
    console.log('has key:', this._isInit)
    if (this.storeMap.has(key)) return;
    let newStore = this.builder();
    // if (this._isInit) initStore(newStore);
    initStore(newStore);
    this.storeMap.set(key, newStore);
    this.disposables.set(key, this.observer(newStore, key));
  }

  delete(key) {
    let store = this.storeMap.get(key);
    store && disposeStore(store);
    this.storeMap.delete(key);
    let disposable = this.disposables.get(key);
    disposable && disposable.dispose();
    this.disposables.delete(key);
  }

  clear() {
    let stores = this.storeMap.values();
    for (let store of stores) {
      disposeStore(store);
    }
    this.storeMap.clear();
    let disposables = this.disposables.values();
    for (let d of disposables) {
      d.dispose();
    }
    this.disposables.clear();
  }

  dispose() {
    this.clear();
  }

  forEach(callback) { return this.storeMap.forEach(callback); }
  get(key) { return this.storeMap.get(key); }
  has(key) { return this.storeMap.has(key); }
  keys() { return this.storeMap.keys(); }
  values() { return this.storeMap.values(); }
  entries() { return this.storeMap.entries(); }
}