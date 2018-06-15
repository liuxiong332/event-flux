module.exports = class StoreMap {
  constructor(builder, observer) {
    this.length = 0;
    this.storeMap = new Map();
    this.disposables = new Map();
    this.builder = builder;
    this.observer = observer;
  }

  add(key) {
    if (this.storeMap.has(key)) return;
    let newStore = this.builder();
    this.storeMap.set(key, newStore);
    this.disposables.set(key, this.observer(newStore, key));
  }

  delete(key) {
    let store = this.storeMap.get(key);
    store && store.dispose();
    this.storeMap.delete(key);
    let disposable = this.disposables.get(key);
    disposable && disposable.dispose();
    this.disposables.delete(key);
  }

  clear() {
    let stores = this.storeMap.values();
    for (let store of stores) {
      store.dispose();
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