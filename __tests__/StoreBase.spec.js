import StoreBase from '../src/StoreBase';

test('StoreBase', () => {
  test('onDidUpdate method', () => {
    let store = new StoreBase();
    let stateChangeMock = jest.fn();
    store.onDidUpdate(stateChangeMock);
    expect(stateChangeMock.mock.calls.length).toBe(0);
    store.setState({ state1: 'dd' });
    expect(stateChangeMock.mock.calls.length).toBe(1);
  });

  test('observe method', () => {
    let store = new StoreBase();
    let stateChangeMock = jest.fn();
    store.observe(stateChangeMock);
    expect(stateChangeMock.mock.calls.length).toBe(1);
    store.setState({ state1: 'dd' });
    expect(stateChangeMock.mock.calls.length).toBe(2);
  });

  test('emitEvent and onEvent', () => {
    let store = new StoreBase();
    let eventMock = jest.fn();
    store.onEvent('myevent', eventMock);
    store.emitEvent('myevent');
    expect(eventMock.mock.calls.length).toBe(1);
    store.dispose();
    expect(store._disposables.length).toBe(0);
  });

  test('setState method', () => {
    let store = new StoreBase();
    let stateChangeMock = jest.fn();
    store.onDidUpdate(stateChangeMock);
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
    let disposable = store.onDidUpdate(stateChangeMock);
    expect(store._disposables.length).toBe(1);
    disposable();
    expect(store._disposables.length).toBe(0);
  })
});
