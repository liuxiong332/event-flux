import StoreBase from "./StoreBase";

export interface StoreBaseConstructor<T> {
  new (...args: any[]): StoreBase<T>;
}

export interface StoreDeclarerOptions {
  args?: [any];
  storeKey?: string;
  stateKey?: string;
  depStoreNames?: string[];
  defaultFilter?: boolean;
}

const IS_STORE = '@@__STORE_ITEM__@@';
class StoreDeclarer<T> {
  Store: StoreBaseConstructor<T>;
  options: StoreDeclarerOptions | undefined;

  constructor(Store: StoreBaseConstructor<T>, options?: StoreDeclarerOptions) {
    this.Store = Store;
    this.options = options;
  }
  
  [IS_STORE] = true;

  static isStore(maybeStore: any) {
    return !!(maybeStore && maybeStore[IS_STORE]);
  }
}


function declareStore<T>(Store: StoreBaseConstructor<T>, options?: StoreDeclarerOptions) {
  return new StoreDeclarer(Store, options);
}

export interface StoreListDeclarerOptions {
  args?: [any];
  storeKey?: string;
  size?: number;
  stateKey?: string;
  depStoreNames?: string[];
}
const IS_STORE_LIST = '@@__STORE_LIST__@@';

class StoreListDeclarer<T> {
  Store: StoreBaseConstructor<T>;
  options: StoreListDeclarerOptions | undefined;

  constructor(Store: StoreBaseConstructor<T>, options?: StoreListDeclarerOptions) {
    this.Store = Store;
    this.options = options;
  }

  [IS_STORE_LIST] = true;

  static isStoreList(maybeList: any) {
    return !!(maybeList && maybeList[IS_STORE_LIST]);
  }
}

function declareStoreList<T>(Store: StoreBaseConstructor<T>, options?: StoreListDeclarerOptions) {
  return new StoreListDeclarer(Store, options);
}

// when directInsert is true, then the child state will set into the store directly.
export interface StoreMapDeclarerOptions {
  args?: [any];
  storeKey?: string;
  depStoreNames?: string[];
  keys?: [string];
  directInsert?: boolean;
  defaultFilter?: boolean;
  storeDefaultFilter?: boolean;
}
const IS_STORE_MAP = '@@__STORE_MAP__@@';

class StoreMapDeclarer<T> {
  Store: StoreBaseConstructor<T>;
  options: StoreMapDeclarerOptions | undefined;

  constructor(Store: StoreBaseConstructor<T>, options?: StoreMapDeclarerOptions) {
    this.Store = Store;
    this.options = options;
  }

  [IS_STORE_MAP] = true;
 
  static isStoreMap(maybeMap: any) {
    return !!(maybeMap && maybeMap[IS_STORE_MAP]);
  }
}

function declareStoreMap<T>(Store: StoreBaseConstructor<T>, options?: StoreMapDeclarerOptions) {
  return new StoreMapDeclarer(Store, options);
}

export {
  StoreDeclarer, StoreListDeclarer, StoreMapDeclarer, 
  declareStore, declareStoreList, declareStoreMap 
};
