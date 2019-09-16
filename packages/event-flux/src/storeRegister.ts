import { StoreDeclarer, StoreBaseConstructor, StoreDeclarerOptions, StoreListDeclarerOptions, StoreListDeclarer, StoreMapDeclarer, StoreMapDeclarerOptions } from "./StoreDeclarer";

export function registerStore<T>(StoreClass: StoreBaseConstructor<T>, depStoreNames: string[], options: StoreDeclarerOptions) {
  let storeDeclarer: StoreDeclarer<T>;
  if (Array.isArray(depStoreNames)) {
    storeDeclarer = new StoreDeclarer(StoreClass, Object.assign({ depStoreNames }, options));
  } else {
    storeDeclarer = new StoreDeclarer(StoreClass, depStoreNames); 
  }
}

export function registerStoreList<T>(StoreClass: StoreBaseConstructor<T>, depStoreNames: string[], options: StoreListDeclarerOptions) {
  let storeDeclarer: StoreListDeclarer<T>;
  if (Array.isArray(depStoreNames)) {
    storeDeclarer = new StoreListDeclarer(StoreClass, Object.assign({ depStoreNames }, options));
  } else {
    storeDeclarer = new StoreListDeclarer(StoreClass, depStoreNames); 
  }
}

export function registerStoreMap<T>(StoreClass: StoreBaseConstructor<T>, depStoreNames: string[], options: StoreMapDeclarerOptions) {
  let storeDeclarer: StoreMapDeclarer<T>;
  if (Array.isArray(depStoreNames)) {
    storeDeclarer = new StoreMapDeclarer(StoreClass, Object.assign({ depStoreNames }, options));
  } else {
    storeDeclarer = new StoreMapDeclarer(StoreClass, depStoreNames); 
  }
}