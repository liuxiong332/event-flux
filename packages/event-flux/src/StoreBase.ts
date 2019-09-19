import { Emitter, Disposable, CompositeDisposable, DisposableLike } from 'event-kit';
import DispatchParent from './DispatchParent';
import DispatchItem from './DispatchItem';

const IS_STORE = '@@__FLUX_STORE__@@';

export function eventListener(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  return target[propertyKey];
}

export function reducer(target: StoreBase<any>, propertyKey: string, descriptor: PropertyDescriptor) {
  return function(...args: any[]) {
    target._disableUpdate();
    Promise.resolve(target[propertyKey](...args)).finally(() => {
      target._enableUpdate();
    });
  }
}

export function returnReducer(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  return function(...args: any[]) {
    target._disableUpdate();
    return Promise.resolve(target[propertyKey](...args)).finally(() => {
      target._enableUpdate();
    });
  }
}

export default class StoreBase<StateT> {
  state: StateT = {} as StateT;

  _emitter = new Emitter();
  _disposables = new CompositeDisposable();

  _inWillUpdate = false;
  _willUpdateStates: any[] = [];

  _appStore: DispatchParent;
  _args: any = null;
  _stateKey: string | undefined;

  _refCount = 0;
  __enableUpdate: boolean = true;
  _hasUpdate = false;

  [storeKey: string]: any;

  static isStore: (store: any) => boolean;
  // static innerStores;

  constructor(appStore: DispatchParent) {
    this._appStore = appStore;
  }

  /**
   * Inject the store's dependency stores into this store, It will be invoked before init
   * @param depStores: the store's dependencies, the dependency stores will be injected to this store
   */
  _inject(stateKey?: string, depStores?: { [storeKey: string]: DispatchItem }, initState?: any, args?: any) {
    this._stateKey = stateKey;
    if (depStores) {
      for (let storeKey in depStores) {
        this[storeKey] = depStores[storeKey];
      }
    }
    this._args = args;

    // Observe this store's state and send the state to appStore
    if (initState) {
      this.state = initState;
      this.addDisposable(this.onDidUpdate(this._handleUpdate));  
    } else {
      this.addDisposable(this.observe(this._handleUpdate));  
    }
  }

  _handleUpdate = (state: any) => {
    let stateKey = this._stateKey;
    if (stateKey) {
      this._appStore.setState({ [stateKey]: state });
    } else {
      this._appStore.setState(state);
    }
  };

  _init() {
    // Before init, we will disable update
    this.__enableUpdate = false;
    Promise.resolve(this.init()).finally(() => {
      // After init, We will send the new state to appStore and enable update
      this.__enableUpdate = true;
      this._emitter.emit('did-update', this.state);
    });
  }

  init() {}

  _disableUpdate() {
    this.__enableUpdate = false;
  }

  _enableUpdate() {
    this.__enableUpdate = true;
    if (this._hasUpdate) {
      this._hasUpdate = false;
      this._emitter.emit('did-update', this.state);
    }
  }

  getArgs() {
    return this._args; 
  }

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
    if (this.__enableUpdate) {
      this._emitter.emit('did-update', this.state);
    } else {
      this._hasUpdate = true;
    }
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

  addDisposable(item: DisposableLike) {
    this._disposables.add(item);
  }

  dispose() {
    this._disposables.dispose();
    this._emitter.dispose();
    this._handleUpdate(undefined);
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
  }

  getRefCount() {
    return this._refCount;
  }
}

(StoreBase.prototype as any)[IS_STORE] = true;
StoreBase.isStore = function(maybeStore: any) {
  return !!(maybeStore && maybeStore[IS_STORE]);
}