const IS_STORE = '@@__STORE_ITEM__@@';
function StoreDeclarer(Store, options) {
  this.Store = Store;
  this.options = options;
}
StoreDeclarer.prototype[IS_STORE] = true;
StoreDeclarer.isStore = function(maybeStore) {
  return !!(maybeStore && maybeStore[IS_STORE]);
}

function declareStore(Store, options) {
  return new StoreDeclarer(Store, options);
}

const IS_STORE_LIST = '@@__STORE_LIST__@@';
function StoreListDeclarer(Store, options) {
  this.Store = Store;
  this.options = options;
}

StoreListDeclarer.prototype[IS_STORE_LIST] = true;
StoreListDeclarer.isStoreList = function(maybeList) {
  return !!(maybeList && maybeList[IS_STORE_LIST]);
}

function declareStoreList(Store, options) {
  return new StoreListDeclarer(Store, options);
}

const IS_STORE_MAP = '@@__STORE_MAP__@@';
function StoreMapDeclarer(Store, options) {
  this.Store = Store;
  this.options = options;
}

StoreMapDeclarer.prototype[IS_STORE_MAP] = true;
StoreMapDeclarer.isStoreMap = function(maybeMap) {
  return !!(maybeMap && maybeMap[IS_STORE_MAP]);
}

function declareStoreMap(Store, options) {
  return new StoreMapDeclarer(Store, options);
}

module.exports = { 
  StoreDeclarer, StoreListDeclarer, StoreMapDeclarer, 
  declareStore, declareStoreList, declareStoreMap 
};
