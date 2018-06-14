/*
  Given an source Store and find all of the store names

  Examples:
  new TodoStore({ hello: new HelloStore, world: new WorldStore }) => { todoStore: { hello, world } }  
*/

const keys = require('lodash/keys');
const isObject = require('lodash/isObject');
import StoreBase from '../../../event-flux/src/StoreBase';
import { StoreListDeclarer, StoreMapDeclarer } from '../StoreDeclarer';

function filterOneStore(StoreClass) {
  if (!StoreClass) return null;
  let innerStores = StoreClass.innerStores;
  if (!innerStores) return null;

  let filters = {};
  for (let key in innerStores) {
    let value = innerStores[key];
    if (!isObject(value)) {
      throw new Error('The innerStores value must be Store or StoreList, StoreMap');
    }
    if (StoreListDeclarer.isStoreList(value)) {
      filters[key] = {
        type: 'StoreList',
        filters: filterOneStore(value.Store),
      }
    } else if (StoreMapDeclarer.isStoreMap(value)) {
      filters[key] = {
        type: 'StoreMap',
        filters: filterOneStore(value.Store),
      };
    } else {
      filters[key] = { 
        type: 'Store',
        filters: filterOneStore(value),
      };
    }
  }
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
