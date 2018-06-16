/*
  Given an source Store and find all of the store names

  Examples:
  new TodoStore({ hello: new HelloStore, world: new WorldStore }) => { todoStore: { hello, world } }  
*/

const keys = require('lodash/keys');
const isFunction = require('lodash/isFunction');
const omit = require('lodash/omit');
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
    this[storeKey] = new StoreList(options && options.size || 0, storeBuilder, storeObserver);
  },
  Map: function (StoreClass, storeKey, stateKey, options) {
    let storeBuilder = () => this.buildStore(StoreClass);
    let storeObserver = (store, index) => {
      return store.observe(state => this.setState({
        [stateKey]: { ...this.state[stateKey], [index]: state },
      }));
    }
    this[storeKey] = new StoreMap(options && options.keys, storeBuilder, storeObserver);
  }
}

exports.filterOneStore = function filterOneStore(StoreClass) {
  if (!StoreClass) return null;
  let innerStores = StoreClass.innerStores;
  if (!innerStores) return null;

  let filters = {};
  let subStoreInfos = [];
  for (let key in innerStores) {
    let value = innerStores[key];
    if (isFunction(value)) {
      let storeName = key + 'Store';
      filters[storeName] = { 
        type: 'Store',
        filters: filterOneStore(value),
      };
      subStoreInfos.push(['Item', value, storeName, key]);
    } else {
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
  }
  StoreClass.prototype.buildStores = function() {
    console.log('buildStores this:', this.buildStore);
    subStoreInfos.forEach(([type, StoreClass, storeKey, stateKey, options]) => {
      storeBuilders[type].call(this, StoreClass, storeKey, stateKey, options);
    });
  };
  StoreClass.prototype.initStores = function() {
    subStoreInfos.forEach((info) => {
      let storeKey = info[2];
      this[storeKey] && this[storeKey]._initWrap();
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

exports.filterStore = function filterStore(stores) {
  let storeFilters = {};
  for (let key in stores) {
    let store = stores[key];
    storeFilters[key] = { type: 'Store', filters: filterOneStore(store.constructor) };
  }
  return storeFilters;
};

exports.filterWindowStore = function(storeFilters, winStoreKey, winId) {
  let winFilters = storeFilters[winStoreKey].filters;
  if (!winFilters) return storeFilters;
  winFilters = winFilters[winId].filters;
  if (!winFilters) return storeFilters;
  let winOnlyShape = {};
  Object.keys(winFilters).forEach(storeKey => {
    winOnlyShape[storeKey] = { ...winFilters[storeKey], path: [winStoreKey, winId] };
  })
  return { ...omit(storeFilters, [winStoreKey]), ...winOnlyShape };
}

exports.filterWindowState = function filterWindowState(allState, winStateKey, winId) {
  if (!allState[winStateKey]) return allState;
  let winState = allState[winStateKey][winId];
  return { ...omit(allState, [winStateKey]), ...winState };
}

exports.filterWindowDelta = function filterWindowDelta(updated, deleted, winStateKey, winId) {
  return [
    filterWindowState(updated, winStateKey, winId),
    filterWindowState(deleted, winStateKey, winId)
  ];
}