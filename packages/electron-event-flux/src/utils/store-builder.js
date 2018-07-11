exports.initStore = function(store, parentStore) {
  store.buildStores && store.buildStores();
  store.parentStore = parentStore;
  store.willInit && store.willInit();
  store.initStores && store.initStores(store);
  store._initWrap();
  store.startObserve && store.startObserve();
}

exports.disposeStore = function(store) {
  store.disposeStores && store.disposeStores();
  store.dispose();
}