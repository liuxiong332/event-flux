import StoreBase from '../StoreBase';
import StoreList from '../StoreList';

jest.useFakeTimers();

describe('StoreList', () => {
  test('init with size 0', () => {
    let dispatchParent = { setState: jest.fn };
    let storeList = new StoreList(dispatchParent, StoreBase, { size: 0 });
    storeList._inject("hello", { dep: new StoreBase(dispatchParent) });
    storeList._init();

    expect(storeList.length).toBe(0);
    expect(storeList.storeArray).toEqual([]);
  });

  test('init with size 2 and initial states', () => {
    let dispatchParent = { setState: jest.fn };
    let storeList = new StoreList(dispatchParent, StoreBase, { size: 2 });
    storeList._inject("hello", { dep: new StoreBase(dispatchParent) }, { 0: { hello: 0 }, 1: { hello: 1 } });

    storeList._init();

    expect(storeList.length).toBe(2);
    expect(storeList.storeArray[0].state).toEqual({ hello: 0 });
    expect(storeList.storeArray[0].dep).toBeTruthy();

    expect(storeList.storeArray[1].state).toEqual({ hello: 1 });
    expect(storeList.storeArray[1].dep).toBeTruthy();
  });

  test('init with size 2 and can update to parent', async () => {
    let dispatchParent = { setState: jest.fn };
    let storeList = new StoreList(dispatchParent, StoreBase, { size: 2 });
    storeList._inject("hello", {});

    await storeList._init();
    expect(storeList.length).toBe(2);
    expect(storeList.state).toEqual({ 0: {}, 1: {} });

    storeList.storeArray[0].setState({ "hello": 11 });
    storeList.storeArray[1].setState({ "hello": 12 });
    jest.runAllTimers();

    expect(storeList.state).toEqual({ 0: { "hello": 11 }, 1: { "hello": 12 } })
  });

  test('init with size 2 and dispose normally', async () => {
    let dispatchParent = { setState: jest.fn };
    let storeList = new StoreList(dispatchParent, StoreBase, { size: 2 });
    storeList._inject("hello", {});

    await storeList._init();
    expect(storeList.length).toBe(2);
    expect(storeList.state).toEqual({ 0: {}, 1: {} });

    storeList.storeArray[0].setState({ "hello": 11 });
    storeList.storeArray[1].setState({ "hello": 12 });
    jest.runAllTimers();

    expect(storeList.state).toEqual({ 0: { "hello": 11 }, 1: { "hello": 12 } })
  });
});
