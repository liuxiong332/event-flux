const isEmpty = require('lodash/isEmpty');

/* Gen proxy for the storePath such as [todoMapStore, todoStore] 
  forwardStore standard for the forward path
*/
function genProxy(storePath, forwardStore, forwarder) {
  return new Proxy(forwarder, {
    get: function(target, propName) {
      if (!propName) return;
      if (forwardStore && forwardStore[propName]) return forwardStore[propName];
      return function(...args) {
        forwarder({ store: storePath, method: propName, args });
      };
    }
  })
}

function genIndexProxy(storePath, forwardStore, forwarder) {
  return new Proxy(forwarder, {
    get: function(target, propName) {
      if (!propName) return;
      const retIndexFunc = function(index) {
        storePath = [
          ...storePath.slice(0, -1), 
          { ...storePath[storePath.length - 1], index }
        ];
        return genProxy(storePath, forwardStore, forwarder);
      }
      if (propName === 'get') {
        return retIndexFunc;
      }
      return retIndexFunc(parseInt(propName));
    }
  })
}

function proxyStore(parentStore, storeFilters, forwarder) {
  if (isEmpty(storeFilters)) return null;
  let stores = {};
  for (let name in storeFilters) {
    let storeInfo = storeFilters[name];
    if (storeInfo) {
      let { type, filters } = storeInfo;
      let names;
      if (type === 'Store') {
        names = [...parentStore, name];
      } else if (type === 'StoreList') {
        names = [...parentStore, { name, type: 'List' }];
      } else if (type === 'StoreMap') {
        names = [...parentStore, { name, type: 'Map' }];
      }
      let childStores = proxyStore(names, filters, forwarder);
      if (type === 'Store') {
        stores[name] = genProxy(names, childStores, forwarder);
      } else {
        stores[name] = genIndexProxy(names, childStores, forwarder);
      }
    }
  }
  return stores;
}

module.exports = function proxyStores(storeFilters, forwarder) {
  console.log('storeFilters:', storeFilters)
  let stores = {};
  for (let name in storeFilters) {
    let names = [name];
    let childStores = proxyStore(names, storeFilters[name], forwarder);
    stores[name] = genProxy(names, childStores, forwarder);
  }
  return stores;
}