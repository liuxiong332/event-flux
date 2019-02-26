

// storeClass must be factory or class.
export function buildStore(appStore, storeClass, args, options?: any) {
  let store = new storeClass(...args);
  store._appStore = appStore;
  store.appStores = appStore.stores;
  store.options = options;
  return store;
}
