import { Emitter, Disposable, CompositeDisposable } from 'event-kit';
// import { buildStore } from './buildStore';

const IS_STORE = '@@__FLUX_STORE__@@';

export function eventListener(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  console.log("event listener");
  return target[propertyKey];
}

export function reducer(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  return target[propertyKey];
}

export function returnReducer(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  return target[propertyKey];
}

export default class StoreBase<StateT> {
  state: StateT = {} as StateT;

  _emitter = new Emitter();
  _disposables = new CompositeDisposable();

  _inWillUpdate = false;
  _willUpdateStates: any[] = [];

  _isInit = false;
  _appStore: any = null;
  _args: any = null;

  _refCount = 0;

  [storeKey: string]: any;

  static isStore: (store: any) => boolean;
  // static innerStores;

  StoreBase(appStore: any, depStores: { [key: string]: StoreBase<any> }, args: any) {
    this._appStore = appStore;
    for (let storeKey in depStores) {
      this[storeKey] = depStores[storeKey];
    }
    this._args = args;
  }

  _initWrap() {
    if (!this._isInit) {
      this.init && this.init();
      this._isInit = true;
    }
  }

  willInit() {}

  init() {}

  // Create new store from storeClass. storeClass must be factory or class.  
  // buildStore(storeClass, args, options) {
  //   if (!this._appStore) return console.error('Can not invoke buildStore in constructor');
  //   return buildStore(this._appStore, storeClass, args, options);
  // }

  setState(state: any) {
    // 当will-update，将状态保存到缓存队列中
    if (this._inWillUpdate) {
      this._willUpdateStates.push(state);
      return;
    }
    // Make the update delay to next tick that can collect many update into one operation.
    let nextState = Object.assign({}, this.state, state); 
    this._inWillUpdate = true;   
    this._emitter.emit('will-update', nextState);
    this._inWillUpdate = false;
    if (this._willUpdateStates.length > 0) {
      this.state = this._willUpdateStates.reduce((allState, state) => 
        Object.assign(allState, state
      ), nextState);
      this._willUpdateStates = [];
    } else {
      this.state = nextState;
    }

    // Send update notification.
    this._emitter.emit('did-update', this.state);
  }

  @eventListener
  onDidUpdate(callback: (value: StateT) => void): Disposable {
    return this._emitter.on('did-update', callback);
  }

  @eventListener
  onWillUpdate(callback: (value: StateT) => void) {
    return this._emitter.on('will-update', callback);    
  }

  @eventListener
  observe(callback: (value: StateT) => void) {
    callback(this.state);
    return this._emitter.on('did-update', callback);    
  }

  addDisposable(item: Disposable) {
    this._disposables.add(item);
  }

  dispose() {
    this._disposables.dispose();
    this._emitter.dispose();
  }

  getState() {
    return this.state;
  }

  // Add the ref count and avoid recycle this store
  _addRef() {
    this._refCount += 1;
  }

  // Decrease the store's ref count, if this ref count decrease to 0, this store  will be disposed.
  _decreaseRef() {
    this._refCount -= 1;
    if (this._refCount === 0 && this._appStore.recycleStrategy === RecycleStrategy.Urgent) {
      this.dispose();
      this._appStore.removeStore(this.storeKey);
    }
  }
}

(StoreBase.prototype as any)[IS_STORE] = true;
StoreBase.isStore = function(maybeStore: any) {
  return !!(maybeStore && maybeStore[IS_STORE]);
}