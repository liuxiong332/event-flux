module.exports = class AsyncStorage {
  // Update the version when the storage is obsolete
  constructor(version, ns) {
    this.version = version;
    if (version) this.init();
    this.ns = ns;
  }

  init() {
    if (version) {
      const curVersion = parseInt(this.getItem('version'));
      if (version !== curVersion) {
        localStorage.clear();
        localStorage.setItem('version', version);
      }
    }
  }

  set(key, value) {
    if (typeof key === 'object') {
      for (let k in key) {
        this.set(k, key[k]);
      }
      return;
    }
    key = this.ns ? this.ns + '.' + key : key;
    if (value === undefined) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, JSON.stringify(value));
    }
  }

  get(key, defaultValue) {
    key = this.ns ? this.ns + '.' + key : key;
    let value = localStorage.getItem(key);
    return value ? JSON.parse(value) : defaultValue;
  }

  delete(key) {
    key = this.ns ? this.ns + '.' + key : key;
    localStorage.removeItem(key);
  }

  getNSStore(namespace) {
    namespace = this.ns ? this.ns + '.' + namespace : namespace;
    return new AsyncStorage(null, namespace);
  }
}