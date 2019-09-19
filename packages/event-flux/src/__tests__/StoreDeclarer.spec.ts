import StoreBase from '../StoreBase';
import { declareStore } from "../StoreDeclarer";
import DispatchParent from '../DispatchParent';

class TodoStore extends StoreBase<{ todo2: string }> {
  constructor(appStore: DispatchParent) {
    super(appStore);
    this.state = { todo2: 'todo2' };
  }
}

jest.useFakeTimers();

describe('StoreDeclarer', () => {
  
  test('should create normally for 2 params', () => {
    let storeDeclarer = declareStore(TodoStore, { args: "hello" });
    expect(storeDeclarer.Store).toBe(TodoStore);
    expect(storeDeclarer.depStoreNames).toEqual([]);
    expect(storeDeclarer.options).toEqual({ storeKey: "todoStore", stateKey: "todo", args: "hello" });
  });

  test('should create normally for 3 params', () => {
    let storeDeclarer = declareStore(TodoStore, ["todo2", "todo3"], { args: "hello" });
    expect(storeDeclarer.Store).toBe(TodoStore);
    expect(storeDeclarer.depStoreNames).toEqual(["todo2", "todo3"]);
    expect(storeDeclarer.options).toEqual({ storeKey: "todoStore", stateKey: "todo", args: "hello" });
  });
});
