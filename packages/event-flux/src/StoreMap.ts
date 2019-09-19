import { StoreMapDeclarerOptions, StoreBaseConstructor, StoreMapDeclarer } from './StoreDeclarer';
import DispatchItem from './DispatchItem';
import DispatchParent from './DispatchParent';

export default class StoreMap<T> {
  storeMap: Map<string, any> = new Map();

  _options: StoreMapDeclarerOptions | undefined;
  _StoreBuilder: StoreBaseConstructor<T> | undefined;
  _depStores: { [storeKey: string]: DispatchItem } = {};
  _stateKey: string | undefined;

  _appStore: DispatchParent;
  _refCount = 0;

  __initStates__: any;
  state: any = {};

  constructor(appStore: DispatchParent) {
    this._appStore = appStore;
  }

  _init() {
    let keys = this._options!.keys;
    if (keys && Array.isArray(keys)) {
      return Promise.all([...keys.map(key => this.add(key)), this.init()]);
    }
    return this.init();
  }

  init() {}
  
  _inject(StoreBuilder: StoreBaseConstructor<T>, stateKey?: string, depStores?: { [storeKey: string]: DispatchItem }, initState?: any, options?: StoreMapDeclarerOptions) {
    this._stateKey = stateKey;
    if (!stateKey) console.error("StoreList can not let stateKey to null");

    this._StoreBuilder = StoreBuilder;
    this._options = options!;

    if (depStores) {
      this._depStores = depStores;
    }
    if (initState) {
      this.__initStates__ = initState;
      this.state = initState;
    }
  }

  add(key: string) {
    if (this.storeMap.has(key)) return;
    let newStore = new this._StoreBuilder!(this);
    (newStore as any).mapStoreKey = key;

    let initState = this.__initStates__ ? this.__initStates__[key] : undefined;
    newStore._inject(this._StoreBuilder!, key, this._depStores, initState, {});
    this.storeMap.set(key, newStore);
    return newStore._init();
   }

  delete(key: string) {
    let store = this.storeMap.get(key);
    store.dispose();
    this.storeMap.delete(key);
  }

  clear() {
    let stores = this.storeMap.values();
    for (let store of stores) {
      store.dispose();
    }
    this.storeMap.clear();
  }

  setState(state: any) {
    this.state = { ...this.state, ...state };
    if (this._stateKey) {
      this._appStore.setState({ [this._stateKey]: this.state });
    }
  }

  dispose() {
    this.clear();
    this.state = {};
    if (this._stateKey) {
      this._appStore.setState({ [this._stateKey]: undefined });
    }
  }

  forEach(callback: (value: any, key: string, map: Map<string, any>) => void) { 
    return this.storeMap.forEach(callback); 
  }

  get(key: string) { return this.storeMap.get(key); }

  has(key: string) { return this.storeMap.has(key); }

  keys() { return this.storeMap.keys(); }

  values() { return this.storeMap.values(); }

  entries() { return this.storeMap.entries(); }

  _addRef() {
    this._refCount += 1;
  }

  _decreaseRef() {
    this._refCount -= 1;
  }

  getRefCount() {
    return this._refCount;
  }
}
