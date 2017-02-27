import vmAdder from '../src/vmAdder';
import StoreBase from '../src/StoreBase';

test('vmAdder', () => {
  let VMModule = null;
  beforeEach(() => {
    VMModule = vmAdder(Object);
  });

  test('observeState and addStateChange', () => {
    let module = new VMModule();
    let store = new StoreBase();
    module.setState = jest.fn();
    let disposable = store.addStateChange(module.onStateChange);
    expect(module.setState.calls.length).toBe(0);
    store.setState({ hello: 'world' });
    expect(module.setState.calls[0][0]).toMatchObject({ hello: 'world' });
    disposable.dispose();
    store.setState({ hello: 'myworld'});
    expect(module.setState.calls.length).toBe(1);
  });

  test('addStoreEvent', () => {
    let module = new VMModule();
    let store = new StoreBase();
    let mockFn = jest.fn();
    let disposable = store.addStoreEvent('myevent', mockFn);
    store.emitEvent('myevent');
    expect(mockFn.calls.length).toBe(1);
  });

  test('no notification will emit after unmount', () => {
    let module = new VMModule();
    let store = new StoreBase();
    module.setState = jest.fn();
    module.addDisposable(store.addStateChange(module.onStateChange));
    store.setState({ hello: 'world' });
    expect(module.setState.calls[0][0]).toMatchObject({ hello: 'world' });
    module.componentWillUnmount();
    store.setState({ hello: 'myworld' });
    expect(module.setState.calls.length).toBe(1);
  });
});
