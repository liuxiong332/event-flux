export default class AsyncStorage {
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
    key = this.ns ? this.ns + '.' + key : key;
    if (value === null || value === undefined) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, value);
    }
  }

  get(key, defaultValue) {
    key = this.ns ? this.ns + '.' + key : key;
    return localStorage.getItem(key) || defaultValue;
  }

  delete(key) {
    key = this.ns ? this.ns + '.' + key : key;
    localStorage.removeItem(key);
  }

  getNSStore(namespace) {
    return new AsyncStorage(null, namespace);
  }
}