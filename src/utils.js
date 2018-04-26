export function findInList(list, func) {
  let len = list.length;
  for (let i = 0; i < len; ++i) {
    if (func(func(list[i]))) return list[i];
  }
}

export function pick(obj, keys) {
  let resObj = {};
  for(let key of keys) {
    if (key in obj) {
      resObj[key] = obj[key];      
    }
  }
  return resObj;
}


// storeClass must be factory or class.
function buildStore(appStore, storeClass) {
  let store = null;
  if (typeof storeClass === 'function') {
    store = storeClass();
  } else {
    store = new storeClass();
  }
  store.batchUpdater = appStore.batchUpdater;
  store._appStore = appStore;
  injectDependencies(appStore, store);
  return store;
}

function buildObserveStore(store, storeClass) {
  buildStore(store._appStore, storeClass);
  store.observeState((state) => {
    let key = store.constructor.getStateKey();
    appStore.setState({ [key]: state });
  });
}

// Inject the instances into the store by the dependencies static properties
export function injectDependencies(appStore, store) {
  let stores = appStore.stores;
  let deps = store.constructor.dependencies;
  if (!deps) return;
  deps.forEach(dep => {
    let depStore = null;
    if (typeof dep === 'string') {
      depStore = findInList(stores, (s) => s.constructor.name === dep);
      if (!depStore) {
        return console.error(`The dep ${dep} cannot find in stores`);
      }
    } else {
      depStore = findInList(stores, (s) => s.constructor === dep);      
      if (!depStore) {
        depStore = buildObserveStore(appStore, dep);
        stores[depStore.constructor.getStoreKey()] = stores;
      }
    }
    let name = depStore.constructor.name;
    let injectKey = name[0].toLowerCase() + name.slice(1); 
    store[injectKey] = depStore;
  });
}
