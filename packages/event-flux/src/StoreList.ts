import { initStore, disposeStore } from './storeBuilder';
import { Emitter, Disposable } from 'event-kit';
import StoreBase from './StoreBase';

type StoreBuilder<T> = () => StoreBase<T>;
type StoreObserver<T> = (store: StoreBase<T>, i: number) => Disposable;

export default class StoreList<T> {
  length: number = 0;
  storeArray: StoreBase<T>[] = [];
  disposables: Disposable[] = [];
  options: any;
  builder: StoreBuilder<T>;
  observer: StoreObserver<T>;
  parentStore: any = null;
  appStores: any;
  emitter = new Emitter();

  constructor(size: number, builder: StoreBuilder<T>, observer: StoreObserver<T>, options: any) {
    this.builder = builder;
    this.observer = observer;
    this.options = options;
    if (size) this.setSize(size);
  }

  _initWrap() {
    // this._isInit = true;
  }

  setSize(count: number) {
    if (this.length === count) return;
    if (this.length < count) {
      for (let i = this.length; i < count; ++i) {
        let newStore = this.builder();
        (newStore as any).listStoreKey = i;

        // if (this._isInit) initStore(newStore);
        initStore(newStore, this.parentStore);
        this.storeArray.push(newStore);
        this.disposables.push(this.observer(newStore, i));
      }
    } else {
      for (let i = count; i < this.length; ++i) {
        this.disposables[i].dispose();
        disposeStore(this.storeArray[i]);
      }
      this.disposables.splice(count, this.length - count);
      this.storeArray.splice(count, this.length - count);
    }
    this.length = count;
  }

  dispose() {
    this.setSize(0);
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
}
