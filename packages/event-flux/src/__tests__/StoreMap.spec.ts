import StoreBase from '../StoreBase';
import StoreMap from '../StoreMap';

jest.useFakeTimers();

describe('StoreMap', () => {
  test('init with size 0', () => {
    let dispatchParent = { setState: jest.fn };
    let storeList = new StoreMap(dispatchParent);
    storeList._inject(StoreBase, "hello", { dep: new StoreBase(dispatchParent) }, undefined, {});
    storeList._init();

    expect(storeList.storeMap.size).toEqual(0);
  });

  test('init with key1, key2 and initial states', () => {
    let dispatchParent = { setState: jest.fn };
    let storeList = new StoreMap(dispatchParent);
    storeList._inject(
      StoreBase, "hello", { dep: new StoreBase(dispatchParent) }, { key1: { hello: 0 }, key2: { hello: 1 } }, { keys: ["key1", "key2"] }
    );

    storeList._init();

    expect(storeList.storeMap.size).toBe(2);
    expect(storeList.storeMap.get("key1").state).toEqual({ hello: 0 });
    expect(storeList.storeMap.get("key1").dep).toBeTruthy();

    expect(storeList.storeMap.get("key2").state).toEqual({ hello: 1 });
    expect(storeList.storeMap.get("key2").dep).toBeTruthy();
  });

  test('init with key1, key2 and can update to parent', async () => {
    let dispatchParent = { setState: jest.fn };
    let storeList = new StoreMap(dispatchParent);
    storeList._inject(StoreBase, "hello", {}, undefined, { keys: ["key1", "key2"] });

    await storeList._init();
    expect(storeList.state).toEqual({ key1: {}, key2: {} });

    storeList.storeMap.get("key1").setState({ "hello": 11 });
    storeList.storeMap.get("key2").setState({ "hello": 12 });
    jest.runAllTimers();

    expect(storeList.state).toEqual({ key1: { "hello": 11 }, key2: { "hello": 12 } })
  });

  test('init with key1, key2 and dispose normally', async () => {
    let dispatchParent = { setState: jest.fn() };
    let storeList = new StoreMap(dispatchParent);
    storeList._inject(StoreBase, "hello", {}, undefined, { keys: ["key1", "key2"] });

    await storeList._init();
    expect(storeList.state).toEqual({ key1: {}, key2: {} });

    storeList.storeMap.get("key1").setState({ "hello": 11 });
    storeList.storeMap.get("key2").setState({ "hello": 12 });
    jest.runAllTimers();

    expect(storeList.state).toEqual({ key1: { "hello": 11 }, key2: { "hello": 12 } });

    let store0 = storeList.storeMap.get("key1");
    store0.dispose = jest.fn();
    await storeList.dispose();
    expect(store0.dispose).toHaveBeenCalled();
    expect(storeList.storeMap.size).toEqual(0);
    expect(dispatchParent.setState).toHaveBeenLastCalledWith({ "hello": undefined });
  });
});
