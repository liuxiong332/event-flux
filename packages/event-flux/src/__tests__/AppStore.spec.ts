import AppStore  from '../AppStore';
import StoreBase from '../StoreBase';

class TodoStore extends StoreBase<{ todo2: string }> {
  constructor(...args: any[]) {
    super(...args);
    this.state = { todo2: 'todo2' };
  }
}

jest.useFakeTimers();

describe('AppStore', () => {
  
  test('appStore observe store state change', () => {
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

  test('onChange', () => {
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

});
