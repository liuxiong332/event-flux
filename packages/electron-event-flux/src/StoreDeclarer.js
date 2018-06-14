
const IS_STORE_LIST = '@@__STORE_LIST__@@';
function StoreListDeclarer(Store) {
  this.Store = Store;
}

StoreListDeclarer.prototype[IS_STORE_LIST] = true;
StoreListDeclarer.isStoreList = function(maybeList) {
  return !!(maybeList && maybeList[IS_STORE_LIST]);
}

function declareStoreList(Store) {
  return new StoreListDeclarer(Store);
}

const IS_STORE_MAP = '@@__STORE_MAP__@@';
function StoreMapDeclarer(Store) {
  this.Store = Store;
}

StoreMapDeclarer.prototype[IS_STORE_MAP] = true;
StoreMapDeclarer.isStoreMap = function(maybeMap) {
  return !!(maybeMap && maybeMap[IS_STORE_MAP]);
}

function declareStoreMap(Store) {
  return new StoreMapDeclarer(Store);
}

export { StoreListDeclarer, StoreMapDeclarer, declareStoreList, declareStoreMap };
