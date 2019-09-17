import StoreBase from './StoreBase';
import BatchUpdateHost from './BatchUpdateHost';
import { buildStore } from './buildStore';
import { StoreDeclarer, StoreListDeclarer, StoreMapDeclarer } from './StoreDeclarer';
import RecycleStrategy from "./RecycleStrategy";

const IS_APP_STORE = '@@__APP_STORE__@@';

type AnyStoreDeclarer = StoreDeclarer<any> | StoreListDeclarer<any> | StoreMapDeclarer<any>;

export default class AppStore {
  _init = false;
  didChangeCallbacks: Function[] = [];

  batchUpdater: BatchUpdateHost;
  prevState: any = {};
  state: any = {};
  stores: { [storeKey: string]: StoreBase<any> } = {};

  _storeRegisterMap: { [storeName: string]: AnyStoreDeclarer } = {};
  _recycleStrategy: RecycleStrategy = RecycleStrategy.Never;
  _depStoreList: { [storeName: string]: string[] } = {};

  // Check any object is AppStore object or not.
  static isAppStore: Function;

  static _appStore: AppStore;
  
  // The AppStore is singleton, you should use getAppStore to get the singleton appStore instance.
  static getAppStore(): AppStore {
    if (!AppStore._appStore) {
      AppStore._appStore = new AppStore();
    }
    return AppStore._appStore;
  }
  
  constructor() {
    this.batchUpdater = new BatchUpdateHost(this);  
  }

  // buildStore(storeClass, args, options) {
  //   return buildStore(this, storeClass, args, options);
  // }

  setState(state: any) {
    if (!this._init) {  // 未初始化完成
      Object.assign(this.state, state);
    } else {
      this.state = Object.assign({}, this.state, state);
      this.batchUpdater.requestUpdate();
    }
  }

  _sendUpdate() {
    this.handleWillChange && this.handleWillChange(this.prevState, this.state);
    this.didChangeCallbacks.forEach(callback => callback(this.state));
    this.prevState = this.state;
  }

  handleWillChange(prevState: any, state: any) {
  }
  
  onDidChange(callback: Function) {
    this.didChangeCallbacks.push(callback);
  }

  init() {
    this._init = true;    
    this.prevState = this.state;
    return this;
  }

  dispose() {
    this.didChangeCallbacks = [];
    this.prevState = this.state = null;
    for (var key in this.stores) {
      let store = this.stores[key];
      if (store instanceof StoreBase) {
        store.dispose();
      }
    }
    this.stores = {};
  }

  /**
   * Register the store into the appStore with storeDeclarer
   * @param storeDeclarer: AnyStoreDeclater
   */
  _registerStore(storeDeclarer: AnyStoreDeclarer) {
    this._storeRegisterMap[storeDeclarer.options!.storeKey!] = storeDeclarer;
  }

  /**
   * Request the appStore to create store by the storeKey if this store has exists and add reference to 1
   * Request the appStore to add reference count if this store has exists.
   * @param storeKey 
   */
  requestStore(storeKey: string) {
    let store = this.stores[storeKey];
    if (!store) {
      // Search all of the dependency stores for this `storeKey` with Breadth first search
      let depList = [storeKey];
      for (let i = 0; i < depList.length; i += 1) {
        let curStoreKey = depList[i];

        let storeInfo = this._storeRegisterMap[curStoreKey];
        if (!storeInfo) {
          console.error(`The request store ${curStoreKey} is not registered!`);
          return;
        }
        let depNames = storeInfo.options!.depStoreNames || [];

        let filterDepNames = [];
        for (let depName of depNames) {
          let depStore = this.stores[depName];

          // If the dependency store has exists, then this store don't need to appear in the depList
          // And if this dependency is the recursive dependency, then we need to remove it from the depList
          if (depStore) {
            // This dependency store is exists, then we need add the reference count.
            depStore._addRef();
          } else if (depList.indexOf(name) !== -1) {
            filterDepNames.push(depName);
          }
        }
    
        depList.splice(depList.length, 0, ...filterDepNames);
      }

      
      // Create all the dependency stores and add the reference count
      for (let i = depList.length - 1; i >= 0; i -= 1) {
        let storeKey = depList[i];
        let storeInfo = this._storeRegisterMap[storeKey];
        let curStore = new this._storeRegisterMap[storeKey].Store(this, storeInfo.options!.args);
        curStore._addRef();
        this.stores[storeKey] = curStore;
      }

      // Inject all of the dependency stores for depList
      for (let i = depList.length - 1; i >= 0; i -= 1) {
        let storeKey = depList[i];
        let storeInfo = this._storeRegisterMap[storeKey];
        let depNames = storeInfo.options!.depStoreNames || [];
        let depStores: { [storeKey: string]: StoreBase<any> } = {};
        for (let depName of depNames) {
          depStores[depName] = this.stores[name];
        }
        this.stores[storeKey]._inject(depStores);
      }

      // Invoke the depList's willInit, the dependency store's willInit will be invoked first
      for (let i = depList.length - 1; i >= 0; i -= 1) {
        let storeKey = depList[i];
        this.stores[storeKey].willInit();
      }

      // Invoke the depList's init, the dependency store's init will be invoked first
      for (let i = depList.length - 1; i >= 0; i -= 1) {
        let storeKey = depList[i];
        this.stores[storeKey].init();
      }
    } else {
      store._addRef();
    }
    return store;
  }

  /**
   * Relase the store reference count with name of storeKey, if the reference count decrease to 0, then the store destroy.
   * @param storeKey 
   */
  releaseStore(storeKey: string) {
    let store = this.stores[storeKey];
    if (!store) return;
    store._decreaseRef();
    if (this._recycleStrategy === RecycleStrategy.Urgent && store.getRefCount() === 0) {
      store.dispose();
      delete this.stores[storeKey];
      (this._storeRegisterMap[storeKey].options!.depStoreNames || []).forEach(name => this.releaseStore(name));
    }
  }
}

(AppStore.prototype as any)[IS_APP_STORE] = true;
AppStore.isAppStore = function(maybeAppStore: any) {
  return !!(maybeAppStore && maybeAppStore[IS_APP_STORE]);
}