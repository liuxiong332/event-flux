const Store = require('electron-store');

export default class ElectronStore {
  store: any;
  ns: string;

  constructor(version, store, ns) {
    this.store = store || new Store();
    this.ns = ns;
    if (version) {
      let curVersion = this.get('version', null);
      if (version !== curVersion) {
        this.clear();
        this.set('version', version);
      }
    }
  }

  getNSStore(ns) {
    ns = this.ns ? this.ns + '.' + ns : ns;
    return new ElectronStore(null, this.store, ns);
  }

  set(key, value) {
    if (!this.ns) return this.store.set(key, value);
    let ns = this.ns;
    if (typeof key === 'object') {
      let newObj = {};
      for (let k in key) {
        newObj[ns + '.' + k] = key[k];
      }
      return this.store.set(newObj);
    }
    this.store.set(ns + '.' + key, value);
  }

  get(key, defaultValue) {
    let ns = this.ns;
    if (!ns) return this.store.get(key, defaultValue);
    return this.store.get(ns + '.' + key, defaultValue);
  }

  delete(key) {
    let ns = this.ns;
    if (!ns) return this.store.delete(key);
    return this.store.delete(ns + '.' + key);
  }

  deleteAll() {
    let ns = this.ns;
    if (!ns) return this.store.clear();
    return this.store.delete(ns);
  }

  clear() {
    this.store.clear();
  }
}