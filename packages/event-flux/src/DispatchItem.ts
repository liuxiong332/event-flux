import { StoreBaseConstructor } from "./StoreDeclarer";

export default interface DispatchItem {
  // Init this dispatch item
  _init(): void;

  // AppStore will inject some state into this dispatch item
  _inject(
    StoreBuilder: StoreBaseConstructor<any>, 
    stateKey?: string, 
    depStores?: { [storeKey: string]: DispatchItem }, 
    initState?: any, 
    options?: any
  ): void;

  // Dispose the dispatch item
  dispose(): void;

  // Add the reference count
  _addRef(): void;

  // Derease the reference count
  _decreaseRef(): void;

  // Get this dispatch item's reference count
  getRefCount(): number;

  _stateKey: string | undefined;
}