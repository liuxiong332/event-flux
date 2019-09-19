import AppStore  from '../AppStore';
import StoreBase from '../StoreBase';
import { declareStore } from '../StoreDeclarer';
import RecycleStrategy from '../RecycleStrategy';

class TodoStore extends StoreBase<{ todo2: string }> {
  constructor(...args: any[]) {
    super(...args);
    this.state = { todo2: 'todo2' };
  }
}

jest.useFakeTimers();

describe('AppStore', () => {
  
  test('can observe store state change', () => {
    let appStore = new AppStore();
    let todo2Store = new TodoStore()
    appStore.stores = { todo2Store };
    todo2Store.observe((state) => appStore.setState({ todo2: state }));
    expect(appStore.state.todo2).toEqual({ todo2: 'todo2' });
    appStore.init();

    todo2Store.setState({ todo2: 'todo3' });
    jest.runAllTimers();
    
    expect(appStore.state).toEqual({ todo2: { todo2: 'todo3' } });
  });

  test('should invoke onChange', () => {
    let onChange = jest.fn();
    let appStore = new AppStore();
    appStore.onDidChange(onChange);
    appStore.handleWillChange = jest.fn();

    let todo2Store = new TodoStore(); 
    todo2Store.observe((state) => appStore.setState({ todo2: state }));
    appStore.stores = { todo2Store };
    let prevState = appStore.state;
    expect(prevState).toEqual({ todo2: { todo2: 'todo2' } });
    appStore.init();

    appStore.stores.todo2Store.setState({ todo2: 'todo3' });
    appStore.setState({ 'hello': 'ddd' });

    jest.runAllTimers();
    expect(appStore.handleWillChange).toHaveBeenCalledTimes(1);
    expect(appStore.handleWillChange).toHaveBeenCalledWith(prevState, { todo2: { todo2: 'todo3' }, hello: 'ddd' });
    expect(onChange).toHaveBeenCalledWith({ hello: 'ddd', todo2: { todo2: 'todo3' } });

    appStore.setState({ 'hello': 'world' });
    jest.runAllTimers();

    expect(appStore.handleWillChange).toHaveBeenCalledWith(
      { hello: 'ddd', todo2: { todo2: 'todo3' } }, 
      { hello: 'world', todo2: { todo2: 'todo3' } }
    );
    expect(onChange).toHaveBeenCalledWith({ hello: 'world', todo2: { todo2: 'todo3' } });
  });

  test("should register store declarer", () => {
    let appStore = new AppStore();
    appStore.registerStore(declareStore(StoreBase), declareStore(TodoStore));

    expect(appStore._storeRegisterMap["storeBaseStore"].Store).toEqual(StoreBase);
    expect(appStore._storeRegisterMap["todoStore"].Store).toEqual(TodoStore);
  });

  test("should request store for dependency store dependen on self", () => {
    class Todo1Store extends StoreBase<any> {}
    class Todo2Store extends StoreBase<any> {}
    class Todo3Store extends StoreBase<any> {}

    let appStore = new AppStore();
    appStore.registerStore(declareStore(Todo1Store, ["todo2Store", "todo3Store"]));
    appStore.registerStore(declareStore(Todo2Store, ["todo1Store", "todo4"]));
    appStore.registerStore(declareStore(Todo3Store));

    appStore.setRecycleStrategy(RecycleStrategy.Urgent);
    appStore.init();

    expect(appStore.stores).toEqual({});
    appStore.requestStore("todo3Store");
    expect(appStore.stores.todo3Store.getRefCount()).toEqual(1);

    appStore.requestStore("todo1Store");
    expect(Object.keys(appStore.stores).sort()).toEqual(["todo1Store", "todo2Store", "todo3Store"]);
    expect(appStore.stores.todo1Store.getRefCount()).toEqual(1);
    expect(appStore.stores.todo2Store.getRefCount()).toEqual(1);
    expect(appStore.stores.todo3Store.getRefCount()).toEqual(2);

    appStore.requestStore("todo1Store");
    expect(appStore.stores.todo1Store.getRefCount()).toEqual(2);

    appStore.releaseStore("todo1Store");
    expect(appStore.stores.todo1Store.getRefCount()).toEqual(1);

    appStore.releaseStore("todo1Store");
    expect(appStore.stores.todo1Store).toBeFalsy();
    expect(appStore.stores.todo2Store).toBeFalsy();

    expect(appStore.stores.todo3Store.getRefCount()).toEqual(1);
    appStore.releaseStore("todo3Store");
    expect(appStore.stores.todo3Store).toBeFalsy();
  });

  test("should relase store with circular dependency stores", () => {
    class Todo1Store extends StoreBase<any> {}
    class Todo2Store extends StoreBase<any> {}
    class Todo3Store extends StoreBase<any> {}

    let appStore = new AppStore();
    appStore.registerStore(declareStore(Todo1Store, ["todo2Store", "todo3Store"]));
    appStore.registerStore(declareStore(Todo2Store, ["todo1Store", "todo4"]));
    appStore.registerStore(declareStore(Todo3Store));

    appStore.setRecycleStrategy(RecycleStrategy.Urgent);
    appStore.init();

    appStore.requestStore("todo1Store");
    expect(Object.keys(appStore.stores).sort()).toEqual(["todo1Store", "todo2Store", "todo3Store"]);
    expect(appStore.stores.todo1Store.getRefCount()).toEqual(1);
    expect(appStore.stores.todo2Store.getRefCount()).toEqual(1);
    expect(appStore.stores.todo3Store.getRefCount()).toEqual(1);

    appStore.requestStore("todo2Store");
    expect(appStore.stores.todo2Store.getRefCount()).toEqual(2);

    appStore.releaseStore("todo1Store");
    expect(appStore.stores.todo1Store.getRefCount()).toEqual(1);
    expect(appStore.stores.todo2Store.getRefCount()).toEqual(1);
    expect(appStore.stores.todo3Store.getRefCount()).toEqual(1);

    appStore.releaseStore("todo1Store");
    expect(appStore.stores.todo1Store).toBeFalsy();
    expect(appStore.stores.todo2Store).toBeFalsy();
    expect(appStore.stores.todo3Store).toBeFalsy();
  });
});
