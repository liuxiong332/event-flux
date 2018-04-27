import AppStore, { parseStores } from '../src/AppStore';
import StoreBase from '../src/StoreBase';

class TodoDep1Store extends StoreBase {}

class Todo2Store extends StoreBase {
  static dependencies = [TodoDep1Store];
  constructor() {
    super();
    this.state = { todo2: 'todo2' };
  }
}

class Todo3Store extends StoreBase {
  static dependencies = ['TodoDep1Store'];
  constructor() {
    super();
    this.state = { todo3: 'todo3' };
  }
}

test('AppStore', () => {
  test('parseStores', () => {
    let stores = parseStores([TodoStore, Todo2Store]);
    expect(stores['todoStore'] instanceof TodoStore).toBeTruthy();
    expect(stores['todo2Store'] instanceof Todo2Store).toBeTruthy();
  });

  test('appStore inject class dependencies', () => {
    let appStore = new AppStore([Todo2Store]);
    expect(appStore.stores.keys()).toEqual(['todo2Store', 'todoDep1Store']);
    let { todo2Store, todoDep1Store } = appStore.stores;
    expect(appStore.state.todo2).toEqual({ todo2: 'todo2' });

    todo2Store.setState({ todo2: 'todo3' });
    todoDep1Store.setState({ 'dep1': 'dep' });
    expect(appStore.state).toEqual({ todo2: { todo2: 'todo3' }, todoDep1: { dep1: 'dep' } });
  });

  test('appStore inject string dependencies', () => {
    let appStore = new AppStore([Todo2Store, TodoDep1Store]);
    expect(appStore.stores.keys()).toEqual(['todo2Store', 'todoDep1Store']);    
  });

  test('onChange', () => {
    let onChange = jest.fn();
    let appStore = new AppStore([Todo2Store, TodoDep1Store], onChange);
    appStore.stores.todo2Store.setState({ todo2: 'todo3' });
    expect(onChange).not.toBeCalled();
    appStore.stores.todo2Store.init = jest.fn();

    appStore.init();
    expect(appStore.stores.todo2Store.init).toBeCalled();

    appStore.setState({ 'hello': 'ddd' });
    expect(onChange).toBeCalledWith({ hello: 'ddd', todo2: { todo2: 'todo3' } });
  });

  test('enable update', () => {
    let onChange = jest.fn();
    let appStore = new AppStore([Todo2Store, TodoDep1Store], onChange);
    appStore.init();
    
    appStore.disableUpdate();
    appStore.setState({ hello: 'hello1' });
    expect(onChange).not.toBeCalled();

    appStore.enableUpdate();
    appStore.setState({ hello2: 'ddd' });
    expect(onChange).toBeCalledWith({ hello: 'hello1', hello2: 'ddd' });
  });
});
