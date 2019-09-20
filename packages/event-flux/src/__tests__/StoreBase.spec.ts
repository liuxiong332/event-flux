import StoreBase, { reducer, returnReducer } from '../StoreBase';
import AppStore from '../AppStore';

jest.useFakeTimers();

describe('StoreBase', () => {
  test("sync init should invoke synchronously", () => {
    class MyStore extends StoreBase<any> {
      state = { hello: 0 };

      init() {
        this.setState({ hello: 1 });
      }
    }
    let appStore = new AppStore();
    let store = new MyStore(appStore);
    store._inject(MyStore, "my", {}, undefined);
    store._init();

    expect(store.state).toEqual({ hello: 1 });
    expect(appStore.state).toEqual({ my: { hello: 1 } });
  });

  test("async init should invoke asynchronously", async () => {
    class MyStore extends StoreBase<any> {
      state = { hello: 0 };

      async init() {
        this.setState({ hello: 1 });
        this.setState({ hello: 2 });
      }
    }
    let appStore = { setState: jest.fn() };
    let store = new MyStore(appStore);
    store._inject(MyStore, "my", {}, undefined);
    await store._init();

    expect(store.state).toEqual({ hello: 2 });
    // console.log(appStore.setState)
    expect(appStore.setState).toHaveBeenCalledTimes(2);
    expect(appStore.setState).toHaveBeenLastCalledWith(
      { my: { hello: 2 } },
    );
  });

  test("should process reducer and returnReducer action", async () => {
    class MyStore extends StoreBase<any> {
      state = { hello: 0 };

      @reducer
      doSync() {
        this.setState({ hello: "doSync" });
      }

      @reducer
      async doAsync() {
        this.setState({ hello: "doAsync" });
      }

      @returnReducer
      doRetSync() {
        return "doRetSync";
      }

      @returnReducer
      async doRetAsync() {
        this.setState({ "hello": "doRetAsync" });
        return "doRetAsync";
      }
    }
    let appStore = { setState: jest.fn() };
    let store = new MyStore(appStore);
    store._inject(MyStore, "my", {}, undefined);
    await store._init();

    appStore.setState.mockReset();
    store.doSync();
    expect(store.state).toEqual({ hello: "doSync" });
    expect(appStore.setState).toHaveBeenCalledWith({ my: { hello: "doSync" } });

    appStore.setState.mockReset();
    await store.doAsync();
    expect(store.state).toEqual({ hello: "doAsync" });
    expect(appStore.setState).toHaveBeenCalledWith({ my: { hello: "doAsync" } });

    appStore.setState.mockReset();
    expect(store.doRetSync()).toBe("doRetSync");
    expect(await store.doRetAsync()).toBe("doRetAsync");
    expect(appStore.setState).toHaveBeenCalledWith({ my: { hello: "doRetAsync" } });
  });

  test('onDidUpdate method', () => {
    let store = new StoreBase(new AppStore());
    let stateChangeMock = jest.fn();
    store.onDidUpdate(stateChangeMock);
    expect(stateChangeMock.mock.calls.length).toBe(0);
    store.setState({ state1: 'dd' });
    jest.runAllTimers();
    expect(stateChangeMock.mock.calls.length).toBe(1);
  });

  test('observe method', () => {
    let store = new StoreBase(new AppStore());
    let stateChangeMock = jest.fn();
    store.observe(stateChangeMock);
    expect(stateChangeMock.mock.calls.length).toBe(1);
    store.setState({ state1: 'dd' });
    jest.runAllTimers();
    expect(stateChangeMock.mock.calls.length).toBe(2);
  });


  test('setState method', () => {
    let store = new StoreBase(new AppStore());
    let stateChangeMock = jest.fn();
    store.onDidUpdate(stateChangeMock);
    store.setState({ hello: 'world' });
    jest.runAllTimers();
    expect(stateChangeMock.mock.calls[0][0]).toMatchObject({ hello: 'world' });
  });

  test('setState will update test', () => {
    let store = new StoreBase(new AppStore());
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
    let store = new StoreBase(new AppStore());
    store.addDisposable({ dispose: () => {} });
    store.onDidUpdate(jest.fn);
    store.dispose();

    expect(store._emitter.disposed).toBeTruthy();
    expect(store._disposables.disposed).toBeTruthy();
  });

  test("storeBase addRef and decreaseRef test", () => {
    let store = new StoreBase(new AppStore());

    store._addRef();
    store._decreaseRef();
    expect(store.getRefCount()).toEqual(0);
  });
});
