const IS_STORE = '@@__STORE_ITEM__@@';
function StoreDeclarer(Store, options?: any) {
  this.Store = Store;
  this.options = options;
}
StoreDeclarer.prototype[IS_STORE] = true;
StoreDeclarer.isStore = function(maybeStore) {
  return !!(maybeStore && maybeStore[IS_STORE]);
}

function declareStore(Store, options?: any) {
  return new StoreDeclarer(Store, options);
}

const IS_STORE_LIST = '@@__STORE_LIST__@@';
function StoreListDeclarer(Store, options?: any) {
  this.Store = Store;
  this.options = options;
}

StoreListDeclarer.prototype[IS_STORE_LIST] = true;
StoreListDeclarer.isStoreList = function(maybeList) {
  return !!(maybeList && maybeList[IS_STORE_LIST]);
}

function declareStoreList(Store, options?: any) {
  return new StoreListDeclarer(Store, options);
}

const IS_STORE_MAP = '@@__STORE_MAP__@@';
function StoreMapDeclarer(Store, options?: any) {
  this.Store = Store;
  this.options = options;
}

StoreMapDeclarer.prototype[IS_STORE_MAP] = true;
StoreMapDeclarer.isStoreMap = function(maybeMap) {
  return !!(maybeMap && maybeMap[IS_STORE_MAP]);
}

function declareStoreMap(Store, options?: any) {
  return new StoreMapDeclarer(Store, options);
}

export { 
  StoreDeclarer, StoreListDeclarer, StoreMapDeclarer, 
  declareStore, declareStoreList, declareStoreMap 
};
