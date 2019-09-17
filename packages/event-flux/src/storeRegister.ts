import { StoreDeclarer, StoreBaseConstructor, StoreDeclarerOptions, StoreListDeclarerOptions, StoreListDeclarer, StoreMapDeclarer, StoreMapDeclarerOptions } from "./StoreDeclarer";
import AppStore from "./AppStore";

const StoreReg = /(\w+)Store$/;
function genDefaultStoreKey(StoreClass: StoreBaseConstructor<any>, options: { stateKey?: string, storeKey?: string } | undefined) {
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

export function registerStore<T>(StoreClass: StoreBaseConstructor<T>, depStoreNames: string[], options: StoreDeclarerOptions) {
  let storeDeclarer: StoreDeclarer<T>;
  if (Array.isArray(depStoreNames)) {
    storeDeclarer = new StoreDeclarer(StoreClass, Object.assign({ depStoreNames }, genDefaultStoreKey(StoreClass, options)));
  } else {
    storeDeclarer = new StoreDeclarer(StoreClass, genDefaultStoreKey(StoreClass, depStoreNames)); 
  }
  AppStore.getAppStore()._registerStore(storeDeclarer);
}

export function registerStoreList<T>(StoreClass: StoreBaseConstructor<T>, depStoreNames: string[], options: StoreListDeclarerOptions) {
  let storeDeclarer: StoreListDeclarer<T>;
  if (Array.isArray(depStoreNames)) {
    storeDeclarer = new StoreListDeclarer(StoreClass, Object.assign({ depStoreNames }, options));
  } else {
    storeDeclarer = new StoreListDeclarer(StoreClass, depStoreNames); 
  }
  AppStore.getAppStore()._registerStore(storeDeclarer);
}

export function registerStoreMap<T>(StoreClass: StoreBaseConstructor<T>, depStoreNames: string[], options: StoreMapDeclarerOptions) {
  let storeDeclarer: StoreMapDeclarer<T>;
  if (Array.isArray(depStoreNames)) {
    storeDeclarer = new StoreMapDeclarer(StoreClass, Object.assign({ depStoreNames }, options));
  } else {
    storeDeclarer = new StoreMapDeclarer(StoreClass, depStoreNames); 
  }
  AppStore.getAppStore()._registerStore(storeDeclarer);
}