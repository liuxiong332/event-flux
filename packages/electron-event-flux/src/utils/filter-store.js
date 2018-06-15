/*
  Given an source Store and find all of the store names

  Examples:
  new TodoStore({ hello: new HelloStore, world: new WorldStore }) => { todoStore: { hello, world } }  
*/

const keys = require('lodash/keys');
const isObject = require('lodash/isObject');
const { StoreDeclarer, StoreListDeclarer, StoreMapDeclarer } = require('../StoreDeclarer');
const StoreList = require('./StoreList');
const StoreMap = require('./StoreMap');

const storeBuilders = {
  Item: function (StoreClass, storeKey, stateKey) {
    this[storeKey] = this.buildStore(StoreClass);
    let disposable = this[storeKey].observe((state) => {
      this.setState({ [stateKey]: state });
    });
    let dispose = this[storeKey].dispose;
    this[storeKey].dispose = function() {
      dispose();
      disposable && disposable.dispose();
    };
  },
  List: function (StoreClass, storeKey, stateKey, options) {
    let storeBuilder = () => this.buildStore(StoreClass);
    let storeObserver = (store, index) => {
      return store.observe(state => {
        let oldStates = this.state[stateKey] || [];
        this.setState({
          [stateKey]: [
            ...oldStates.slice(0, index), 
            state,
            ...oldStates.slice(index + 1), 
          ]
        });
      });
    }
    this[storeKey] = new StoreList(options.size || 0, storeBuilder, storeObserver);
  },
  Map: function (StoreClass, storeKey, stateKey, options) {
    let storeBuilder = () => this.buildStore(StoreClass);
    let storeObserver = (store, index) => {
      return store.observe(state => this.setState({
        [stateKey]: { ...this.state[stateKey], [index]: state },
      }));
    }
    this[storeKey] = new StoreMap(options.keys, storeBuilder, storeObserver);
  }
}

function filterOneStore(StoreClass) {
  if (!StoreClass) return null;
  let innerStores = StoreClass.innerStores;
  if (!innerStores) return null;

  let filters = {};
  let subStoreInfos = [];
  for (let key in innerStores) {
    let value = innerStores[key];
    if (!isObject(value)) {
      throw new Error('The innerStores value must be Store or StoreList, StoreMap');
    }

    let { options, Store } = value;
    let storeName = options && options.storeKey || key + 'Store';

    if (StoreDeclarer.isStore(value)) {
      filters[storeName] = { 
        type: 'Store',
        filters: filterOneStore(Store),
      };
      subStoreInfos.push(['Item', Store, storeName, key, options]);
    } else if (StoreListDeclarer.isStoreList(value)) {
      filters[storeName] = {
        type: 'StoreList',
        filters: filterOneStore(Store),
      }
      subStoreInfos.push(['List', Store, storeName, key, options]);
    } else if (StoreMapDeclarer.isStoreMap(value)) {
      filters[storeName] = {
        type: 'StoreMap',
        filters: filterOneStore(Store),
      };
      subStoreInfos.push(['Map', Store, storeName, key, options]);
    }
  }
  StoreClass.prototype.buildStores = function() {
    console.log('buildStores this:', this.buildStore);
    subStoreInfos.forEach(([type, StoreClass, storeKey, stateKey, options]) => {
      storeBuilders[type].call(this, StoreClass, storeKey, stateKey, options);
    });
  };
  StoreClass.prototype.disposeStores = function() {
    subStoreInfos.forEach(info => {
      let storeKey = info[2];
      this[storeKey] && this[storeKey].dispose();
    });
  };
  return filters;
}

module.exports = function filterStore(stores) {
  let storeFilters = {};
  for (let key in stores) {
    let store = stores[key];
    storeFilters[key] = filterOneStore(store.constructor);
  }
  return storeFilters;
};
