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
        return forwarder({ store: storePath, method: propName, args });
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
      return retIndexFunc(propName);
    }
  })
}

function proxyStore(parentStore, storeFilters, forwarder) {
  if (isEmpty(storeFilters)) return null;
  let stores = {};
  for (let name in storeFilters) {
    let storeInfo = storeFilters[name];
    if (storeInfo) {
      let { type, filters, path = parentStore } = storeInfo;
      let names;
      if (type === 'Store') {
        names = [...path, name];
      } else if (type === 'StoreList') {
        names = [...path, { name, type: 'List' }];
      } else if (type === 'StoreMap') {
        names = [...path, { name, type: 'Map' }];
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
  return proxyStore([], storeFilters, forwarder);
}