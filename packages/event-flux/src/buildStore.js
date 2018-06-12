
import StoreBase from './StoreBase';
import { findInObject } from './utils';

const StoreExp = /Store/;
// Parse the store instance or create instance from instance class
export function parseStore(store) {
  if (typeof store === 'function') {
    return new store();
  } else if (typeof store === 'objec') {
    return store;
  } else {
    console.error('The store you specific must be Store instance or Store class');
    return null;
  }
}

// storeClass must be factory or class.
export function buildStore(appStore, storeClass) {
  let store = parseStore(storeClass);
  store.batchUpdater = appStore.batchUpdater;
  store._appStore = appStore;
  injectDependencies(appStore, store);
  if (appStore._init) store._initWrap();  //appStore已经初始化，直接init store
  return store;
}

export function buildObserveStore(appStore, storeClass) {
  let store = buildStore(appStore, storeClass);
  store.observe((state) => {
    let key = store.getStateKey();
    appStore.setState({ [key]: state });
  });
  return store;
}

// Inject the instances into the store by the dependencies static properties
export function injectDependencies(appStore, store) {
  let stores = appStore.stores;
  let deps = store.constructor.dependencies;
  if (!deps) return;
  deps.forEach(dep => {
    let depStore = null;
    if (typeof dep === 'string') {
      depStore = findInObject(stores, (s) => s.constructor.name === dep);
      if (!depStore) {
        return console.error(`The dep ${dep} cannot find in stores`);
      }
    } else {
      depStore = findInObject(stores, (s) => s.constructor === dep);      
      if (!depStore) {
        depStore = buildObserveStore(appStore, dep);
        stores[depStore.getStoreKey()] = depStore;
      }
    }
    let injectKey = depStore.getStoreKey();
    store[injectKey] = depStore;
  });
}