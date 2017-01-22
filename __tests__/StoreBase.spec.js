import StoreBase from '../src/StoreBase';

test('StoreBase', () => {
  test('addStateChange method', () => {
    let store = new StoreBase();
    let stateChangeMock = jest.fn();
    store.addStateChange(stateChangeMock);
    expect(stateChangeMock.mock.calls.length).toBe(0);
    store.forceUpdate();
    expect(stateChangeMock.mock.calls.length).toBe(1);
  });

  test('observeState method', () => {
    let store = new StoreBase();
    let stateChangeMock = jest.fn();
    store.observeState(stateChangeMock);
    expect(stateChangeMock.mock.calls.length).toBe(1);
    store.forceUpdate();
    expect(stateChangeMock.mock.calls.length).toBe(2);
  });

  test('setState method', () => {
    let store = new StoreBase();
    let stateChangeMock = jest.fn();
    store.addStateChange(stateChangeMock);
    store.setState({ hello: 'world' });
    expect(stateChangeMock.mock.calls[0][0]).toMatchObject({ hello: 'world' });
  });

  test('addDisposable method', () => {
    let store = new StoreBase();
    let stateChangeMock = jest.fn();
    store.addDisposable(store.addStateChange(stateChangeMock));
    expect(store._disposables.length).toBe(1);
    store.dispose();
    expect(store._disposables.length).toBe(0);
  });

  test('the observer callback will clear after dispose', () => {
    let store = new StoreBase();
    let stateChangeMock = jest.fn();
    let disposable = store.addStateChange(stateChangeMock);
    expect(store._disposables.length).toBe(1);
    disposable();
    expect(store._disposables.length).toBe(0);
  })
});
