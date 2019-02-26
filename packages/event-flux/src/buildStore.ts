

// storeClass must be factory or class.
export function buildStore(appStore, storeClass, args) {
  let store = new storeClass(...args);
  store._appStore = appStore;
  store.appStores = appStore.stores;
  return store;
}
