import StoreBase from '../StoreBase';
import RecycleStrategy from "../RecycleStrategy";

jest.useFakeTimers();

describe('StoreBase', () => {
  test('onDidUpdate method', () => {
    let store = new StoreBase();
    let stateChangeMock = jest.fn();
    store.onDidUpdate(stateChangeMock);
    expect(stateChangeMock.mock.calls.length).toBe(0);
    store.setState({ state1: 'dd' });
    jest.runAllTimers();
    expect(stateChangeMock.mock.calls.length).toBe(1);
  });

  test('observe method', () => {
    let store = new StoreBase();
    let stateChangeMock = jest.fn();
    store.observe(stateChangeMock);
    expect(stateChangeMock.mock.calls.length).toBe(1);
    store.setState({ state1: 'dd' });
    jest.runAllTimers();
    expect(stateChangeMock.mock.calls.length).toBe(2);
  });


  test('setState method', () => {
    let store = new StoreBase();
    let stateChangeMock = jest.fn();
    store.onDidUpdate(stateChangeMock);
    store.setState({ hello: 'world' });
    jest.runAllTimers();
    expect(stateChangeMock.mock.calls[0][0]).toMatchObject({ hello: 'world' });
  });

  test('setState will update test', () => {
    let store = new StoreBase();
    store.setState({ hello: 'hello1' });
    let stateChangeMock = jest.fn();
    store.onDidUpdate(stateChangeMock);
    expect(store.state).toEqual({ hello: 'hello1' });

    store.onWillUpdate(function() {
      store.setState({ hello: 'updateHello' });
    });
    store.onWillUpdate(function() {
      store.setState({ hello: 'updateHello2', newKey: 'key' });      
    });
    store.setState({ hello: 'hello1' });
    
    jest.runAllTimers();
    expect(stateChangeMock).toHaveBeenCalledTimes(1);
    expect(store.state).toEqual({ hello: 'updateHello2', newKey: 'key' });
  });

  test("storeBase constructor and dispose test", () => {
    let myAppStore = {
      recycleStrategy:  RecycleStrategy.Urgent,
      removeStore: jest.fn(),
    };
    let store = new StoreBase(myAppStore, {}, { hello: "arg" });
    store.addDisposable({ dispose: () => {} });
    store.onDidUpdate(jest.fn);
    store.dispose();

    expect(store._emitter.disposed).toBeTruthy();
    expect(store._disposables.disposed).toBeTruthy();
  });

  test("storeBase addRef and decreaseRef test", () => {
    let myAppStore = {
      recycleStrategy:  RecycleStrategy.Urgent,
      removeStore: jest.fn(),
    };
    let store = new StoreBase(myAppStore, {}, { hello: "arg" });

    store._addRef();
    store._decreaseRef();
    expect(myAppStore.removeStore).toHaveBeenCalled();
    expect(store._emitter.disposed).toBeTruthy();
  });
});
