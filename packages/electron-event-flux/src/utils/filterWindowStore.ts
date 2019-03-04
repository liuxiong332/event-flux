/*
  1. filterWindowStore({
    winManagerStore: {
      type: "Store",
      filters: {
        winPackMapStore: {
          filters: {
            winTodoStore: { type: "Store" }
          },
          type: "StoreMap"
        }
      }
    }
  }) will return { 
    winTodoStore: { 
      type: "Store", 
      path: ['winManagerStore', {type: "Map", name: "winPackMapStore", index: "mainClient"}] 
    }
  }
  2. filterWindowState({ 
    winManager: { winPackMap: { mainClient: { winTodo: { todo: 0 } } } } 
  }) will return { winTodo: { todo: 0 } }

*/
const omit = require('lodash/omit');

function filterWindowStore(storeFilters, winStoreKey, winId) {
    let winFilters = storeFilters[winStoreKey].filters;
    if (!winFilters) return storeFilters;
    winFilters = winFilters.winPackMapStore.filters;
    if (!winFilters) return omit(storeFilters, [winStoreKey]);
    let winOnlyShape = {};
    let path = [winStoreKey, { type: 'Map', name: 'winPackMapStore', index: winId }];
    Object.keys(winFilters).forEach(storeKey => {
      winOnlyShape[storeKey] = { ...winFilters[storeKey], path };
    });
    return { ...omit(storeFilters, [winStoreKey]), ...winOnlyShape };
  }
  
  function filterWindowState(allState, winStateKey, winId) {
    if (!allState[winStateKey]) return allState;
    let { winPackMap } = allState[winStateKey];
    if (!winPackMap) return omit(allState, [winStateKey]);
    let winState = winPackMap[winId];
  
    return { ...omit(allState, [winStateKey]), ...winState };
  }
  
  function filterWindowDelta(updated, deleted, winStateKey, winId) {
    return [
      filterWindowState(updated, winStateKey, winId),
      filterWindowState(deleted, winStateKey, winId)
    ];
  }
  
  export {
    filterWindowStore, filterWindowState, filterWindowDelta,
  };