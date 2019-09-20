import { StoreDefineObj, StoreDefineItem, genStoreAndState } from "./withEventFlux";

export default function useEventFlux(...args: StoreDefineObj[] | StoreDefineItem[]) {
  let [retStores, newState] = genStoreAndState(args);
  return { ...retStores, ...newState };
}