export default class AsyncStorage {
  // Update the version when the storage is obsolete
  ns: string;
  constructor(version, ns) {
    if (version) this.init(version);
    this.ns = ns;
  }

  init(version) {
    if (version) {
      const curVersion = localStorage.getItem('version');
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