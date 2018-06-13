
import StoreBase from './StoreBase';
import { findInObject } from './utils';

const StoreExp = /Store/;
// Parse the store instance or create instance from instance class
export function parseStore(store) {
  if (typeof store === 'function') {
    return new store();
  } else if (typeof store === 'object') {
    return store;
  } else {
    console.error('The store you specific must be Store instance or Store class');
    return null;
  }
}

const stateKeyReg = /^(\w+)Store$/;

// get store state key from store instance
export function getStateKey(storeClass) {
  if (storeClass.stateKey) return storeClass.stateKey;
  if (!storeClass.storeKey) {
    throw new Error(`Store ${storeClass.name} must provider storeKey or stateKey`);
  }
  let res = stateKeyReg.exec(storeClass.storeKey);
 
  let key = res ? res[1] : storeClass.storeKey + 'State';
  storeClass.stateKey = key;
  return key;
}

export function getStoreKey(storeClass) {
  if (storeClass.storeKey) return storeClass.storeKey;
  if (!storeClass.stateKey) {
    throw new Error(`Store ${storeClass.name} must provider storeKey or stateKey`);
  }
  storeClass.storeKey = storeClass.stateKey + 'Store';
  return storeClass.storeKey;
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
  const stateKey = getStateKey(storeClass);
  store.observe((state) => {
    appStore.setState({ [stateKey]: state });
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
        stores[getStoreKey(depStore.constructor)] = depStore;
      }
    }
    let injectKey = getStoreKey(depStore.constructor);
    store[injectKey] = depStore;
  });
}