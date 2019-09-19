import { Emitter, Disposable } from 'event-kit';
import StoreBase from './StoreBase';
import AppStore from './AppStore';
import { StoreBaseConstructor, StoreListDeclarerOptions, StoreListDeclarer } from './StoreDeclarer';
import DispatchItem from './DispatchItem';
import DispatchParent from './DispatchParent';

export default class StoreList<T> {
  length: number = 0;
  storeArray: StoreBase<T>[] = [];

  _options: StoreListDeclarerOptions | undefined;
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
    if (this._options!.size) {
      return Promise.all([this.setSize(this._options!.size), this.init()]);
    }
    return this.init();
  }

  init() {}

  _inject(StoreBuilder: StoreBaseConstructor<T>, stateKey?: string, depStores?: { [storeKey: string]: DispatchItem }, initState?: any, options?: StoreListDeclarerOptions) {
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

  setSize(count: number): Promise<void[]> | undefined {
    if (this.length === count) return;
    if (this.length < count) {
      let initList = [];
      for (let i = this.length; i < count; ++i) {
        let newStore = new this._StoreBuilder!(this);
        (newStore as any).listStoreKey = i;

        let initState = this.__initStates__ ? this.__initStates__[i] : undefined;
        newStore._inject(this._StoreBuilder!, i.toString(), this._depStores, initState, {});
        this.storeArray.push(newStore);
        // newStore._init();
        initList.push(newStore);
      }
      this.length = count;
      return Promise.all(initList.map(store => store._init()));
    } else {
      for (let i = count; i < this.length; ++i) {
        this.storeArray[i].dispose();
      }
      this.storeArray.splice(count, this.length - count);
      this.length = count;
      return;
    }
  }

  setState(state: any) {
    this.state = { ...this.state, ...state };
    if (this._stateKey) {
      this._appStore.setState({ [this._stateKey]: this.state });
    }
  }

  dispose() {
    this.setSize(0);
    this.state = {};
    if (this._stateKey) {
      this._appStore.setState({ [this._stateKey]: undefined });
    }
  }

  forEach(callback: (value: StoreBase<T>, index: number, array: StoreBase<T>[]) => void) { 
    return this.storeArray.forEach(callback); 
  }

  map(callback: (value: StoreBase<T>, index: number, array: StoreBase<T>[]) => any) { 
    return this.storeArray.map(callback); 
  }
  filter(callback: (value: StoreBase<T>, index: number, array: StoreBase<T>[]) => boolean) { 
    return this.storeArray.filter(callback); 
  }
  get(index: number) { return this.storeArray[index]; }
  slice(begin: number, end: number) { return this.storeArray.slice(begin, end); }
  indexOf(item: StoreBase<T>) { return this.storeArray.indexOf(item); }

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
