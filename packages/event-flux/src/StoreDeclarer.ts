import StoreBase from "./StoreBase";
import AppStore from "./AppStore";
import StoreList from "./StoreList";
import DispatchParent from "./DispatchParent";
import StoreMap from "./StoreMap";

interface IGenericOptions {
  stateKey?: string; 
  storeKey?: string;
  [key: string]: any;
}

const StoreReg = /(\w+)Store$/;
function genDefaultStoreKey(StoreClass: StoreBaseConstructor<any>, options: IGenericOptions | undefined) {
  if (!options) options = {} as { stateKey?: string, storeKey: string };
  if (!options.stateKey) {
    let storeName = StoreClass.name;
    let regRes = StoreReg.exec(storeName);
    let stateKey = regRes ? regRes[1] : storeName;
    options.stateKey = stateKey[0].toLowerCase() + stateKey.slice(1);
  }
  if (!options.storeKey) {
    options.storeKey = options.stateKey + "Store";
  }
  return options;
}

function parseOptions<OptionT extends IGenericOptions>(Store: any, depStoreNames?: string[] | IGenericOptions, options?: OptionT): [string[], OptionT] {
  if (Array.isArray(depStoreNames)) {
    options = genDefaultStoreKey(Store, options) as OptionT;
  } else {
    options = genDefaultStoreKey(Store, depStoreNames) as OptionT;
    depStoreNames = [];
  }
  return [depStoreNames as string[], options];
}

export interface StoreBaseConstructor<T> {
  new (appStore: DispatchParent): StoreBase<T>;
}

export interface StoreListConstructor<T> {
  new (appStore: DispatchParent): StoreList<T>;
}

export interface StoreMapConstructor<T> {
  new (appStore: DispatchParent): StoreMap<T>;
}

export interface StoreDeclarerOptions {
  args?: any;
  storeKey?: string;
  stateKey?: string;
}

const IS_STORE = '@@__STORE_ITEM__@@';
class StoreDeclarer<T> {
  Store: StoreBaseConstructor<T>;
  depStoreNames: string[] | undefined;
  options: StoreDeclarerOptions | undefined;

  constructor(Store: StoreBaseConstructor<T>, depStoreNames?: string[] | StoreDeclarerOptions, options?: StoreDeclarerOptions) {
    this.Store = Store;
    let [names, storeOptions] = parseOptions(Store, depStoreNames, options);
    this.depStoreNames = names;
    this.options = storeOptions;
  }
  
  create(appStore: AppStore): StoreBase<T> {
    return new this.Store(appStore);
  }

  [IS_STORE] = true;

  static isStore(maybeStore: any) {
    return !!(maybeStore && maybeStore[IS_STORE]);
  }
}

function declareStore<T>(Store: StoreBaseConstructor<T>, depStoreNames?: string[] | StoreDeclarerOptions, options?: StoreDeclarerOptions) {
  return new StoreDeclarer(Store, depStoreNames, options);
}

export interface StoreListDeclarerOptions {
  args?: [any];
  storeKey?: string;
  stateKey?: string;
  size?: number;
  StoreList?: StoreListConstructor<any>;
}
const IS_STORE_LIST = '@@__STORE_LIST__@@';

class StoreListDeclarer<T> {
  Store: StoreBaseConstructor<T>;
  depStoreNames: string[] | undefined;
  options: StoreListDeclarerOptions | undefined;

  constructor(Store: StoreBaseConstructor<T>, depStoreNames?: string[] | StoreListDeclarerOptions, options?: StoreListDeclarerOptions) {
    this.Store = Store;
    let [names, storeOptions] = parseOptions(Store, depStoreNames, options);
    this.depStoreNames = names;
    this.options = storeOptions;
  }

  create(appStore: AppStore): StoreList<T> {
    const ListClass = this.options!.StoreList || StoreList;
    return new ListClass(appStore);
  }

  [IS_STORE_LIST] = true;

  static isStoreList(maybeList: any) {
    return !!(maybeList && maybeList[IS_STORE_LIST]);
  }
}

function declareStoreList<T>(Store: StoreBaseConstructor<T>, depStoreNames?: string[] | StoreListDeclarerOptions, options?: StoreListDeclarerOptions) {
  return new StoreListDeclarer(Store, depStoreNames, options);
}

// when directInsert is true, then the child state will set into the store directly.
export interface StoreMapDeclarerOptions {
  args?: [any];
  storeKey?: string;
  stateKey?: string;
  keys?: string[];
  StoreMap?: StoreMapConstructor<any>
}
const IS_STORE_MAP = '@@__STORE_MAP__@@';

class StoreMapDeclarer<T> {
  Store: StoreBaseConstructor<T>;
  depStoreNames: string[] | undefined;
  options: StoreMapDeclarerOptions | undefined;

  constructor(Store: StoreBaseConstructor<T>, depStoreNames?: string[] | StoreMapDeclarerOptions, options?: StoreMapDeclarerOptions) {
    this.Store = Store;
    let [names, storeOptions] = parseOptions(Store, depStoreNames, options);
    this.depStoreNames = names;
    this.options = storeOptions;;
  }

  create(appStore: AppStore): StoreMap<T> {
    const MapClass = this.options!.StoreMap || StoreMap;
    return new MapClass(appStore);
  }

  [IS_STORE_MAP] = true;
 
  static isStoreMap(maybeMap: any) {
    return !!(maybeMap && maybeMap[IS_STORE_MAP]);
  }
}

function declareStoreMap<T>(Store: StoreBaseConstructor<T>, depStoreNames?: string[] | StoreMapDeclarerOptions, options?: StoreMapDeclarerOptions) {
  return new StoreMapDeclarer(Store, depStoreNames, options);
}

export {
  StoreDeclarer, StoreListDeclarer, StoreMapDeclarer, 
  declareStore, declareStoreList, declareStoreMap 
};

export type AnyStoreDeclarer = StoreDeclarer<any> | StoreListDeclarer<any> | StoreMapDeclarer<any>;
