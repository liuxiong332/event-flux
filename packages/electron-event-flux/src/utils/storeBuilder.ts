export function beforeInit(store, parentStore) {
  store.parentStore = parentStore;
  if (parentStore.clientId) {
    store.clientId = parentStore.clientId;
  }
}

export const initStore = function(store, parentStore) {
  store.buildStores && store.buildStores();

  beforeInit(store, parentStore);

  store.willInit && store.willInit();
  store.initStores && store.initStores(store);
  store._initWrap();
  store.startObserve && store.startObserve();
}

export const disposeStore = function(store) {
  store.disposeStores && store.disposeStores();
  store.dispose();
}