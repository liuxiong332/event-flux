const StoreBase = require('./StoreBase');

module.exports = class ReeventApp {
  loadInClient() {
  }

  loadInServer() {
  }

  dispose() {
    for (var key in this) {
      let store = this[key];
      if (store instanceof StoreBase) {
        store.dispose();
      }
    }
  }
}
