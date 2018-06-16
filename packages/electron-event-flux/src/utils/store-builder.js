exports.initStore = function(store) {
  console.log('initStore', store)
  store.buildStores && store.buildStores();
  store.initStores && store.initStores();
  store._initWrap();
  store.startObserve && store.startObserve();
}

exports.disposeStore = function(store) {
  store.disposeStores && store.disposeStores();
  store.dispose();
}