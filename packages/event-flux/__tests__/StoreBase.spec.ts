import StoreBase from '../src/StoreBase';

describe('StoreBase', () => {
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


  test('setState method', () => {
    let store = new StoreBase();
    let stateChangeMock = jest.fn();
    store.onDidUpdate(stateChangeMock);
    store.setState({ hello: 'world' });
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
    expect(stateChangeMock).toHaveBeenCalledTimes(1);
    expect(store.state).toEqual({ hello: 'updateHello2', newKey: 'key' });
  });
});
