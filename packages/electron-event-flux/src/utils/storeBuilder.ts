export const initStore = function(store, parentStore) {
  store.buildStores && store.buildStores();
  store.parentStore = parentStore;
  store.willInit && store.willInit();
  store.initStores && store.initStores(store);
  store._initWrap();
  store.startObserve && store.startObserve();
}

export const disposeStore = function(store) {
  store.disposeStores && store.disposeStores();
  store.dispose();
}