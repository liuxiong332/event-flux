import StoreBase from '../StoreBase';
import StoreList from '../StoreList';

jest.useFakeTimers();

describe('StoreList', () => {
  test('init with size 0', () => {
    let dispatchParent = { setState: jest.fn };
    let storeList = new StoreList(dispatchParent);
    storeList._inject(StoreBase, "hello", { dep: new StoreBase(dispatchParent) }, undefined, { size: 0 });
    storeList._init();

    expect(storeList.length).toBe(0);
    expect(storeList.storeArray).toEqual([]);
  });

  test('init with size 2 and initial states', () => {
    let dispatchParent = { setState: jest.fn };
    let storeList = new StoreList(dispatchParent);
    storeList._inject(
      StoreBase, "hello", { dep: new StoreBase(dispatchParent) }, { 0: { hello: 0 }, 1: { hello: 1 } }, { size: 2 }
    );

    storeList._init();

    expect(storeList.length).toBe(2);
    expect(storeList.storeArray[0].state).toEqual({ hello: 0 });
    expect(storeList.storeArray[0].dep).toBeTruthy();

    expect(storeList.storeArray[1].state).toEqual({ hello: 1 });
    expect(storeList.storeArray[1].dep).toBeTruthy();
  });

  test('init with size 2 and can update to parent', async () => {
    let dispatchParent = { setState: jest.fn };
    let storeList = new StoreList(dispatchParent);
    storeList._inject(StoreBase, "hello", {}, undefined, { size: 2 });

    await storeList._init();
    expect(storeList.length).toBe(2);
    expect(storeList.state).toEqual({ 0: {}, 1: {} });

    storeList.storeArray[0].setState({ "hello": 11 });
    storeList.storeArray[1].setState({ "hello": 12 });
    jest.runAllTimers();

    expect(storeList.state).toEqual({ 0: { "hello": 11 }, 1: { "hello": 12 } })
  });

  test('init with size 2 and dispose normally', async () => {
    let dispatchParent = { setState: jest.fn() };
    let storeList = new StoreList(dispatchParent);
    storeList._inject(StoreBase, "hello", {}, undefined, { size: 2 });

    await storeList._init();
    expect(storeList.length).toBe(2);
    expect(storeList.state).toEqual({ 0: {}, 1: {} });

    storeList.storeArray[0].setState({ "hello": 11 });
    storeList.storeArray[1].setState({ "hello": 12 });
    jest.runAllTimers();

    expect(storeList.state).toEqual({ 0: { "hello": 11 }, 1: { "hello": 12 } });

    let store0 = storeList.storeArray[0];
    store0.dispose = jest.fn();
    await storeList.dispose();
    expect(store0.dispose).toHaveBeenCalled();
    expect(storeList.storeArray).toEqual([]);
    expect(dispatchParent.setState).toHaveBeenLastCalledWith({ "hello": undefined });
  });
});
