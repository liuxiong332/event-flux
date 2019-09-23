import searchCycleCollection from "../searchCycleCollection";
import { declareStore } from "../StoreDeclarer";
import StoreBase from "../StoreBase";

jest.useFakeTimers();

describe('cycleCollectionSearch', () => {
  
  test('should get the cycle list for simple cycle', () => {
    let cycleList = searchCycleCollection({
      a: declareStore(StoreBase, ["b", "c"]),
      b: declareStore(StoreBase, ["a"]),
      c: declareStore(StoreBase),
    });
    expect(cycleList).toEqual([new Set(["a", "b"])]);
  });
 
  test('should get the cycle list for complex cycle', () => {
    let cycleList = searchCycleCollection({
      a: declareStore(StoreBase, ["b", "c"]),
      b: declareStore(StoreBase, ["c", "d"]),
      c: declareStore(StoreBase, ["b", "a"]),
      d: declareStore(StoreBase, ["a", "b", "c"])
    });
    expect(cycleList).toEqual([
      new Set(["b", "c"]),
      new Set(["a", "b", "c"]),
      new Set(["a", "b", "d"]),
      new Set(["b", "d"]),
      new Set(["b", "d", "c"]),
      new Set(["a", "b", "d", "c"]),
      new Set(["a", "c"]), 
    ]);
  });

  test("should get the cycle list for seperate cycle", () => {
    let cycleList = searchCycleCollection({
      a: declareStore(StoreBase, ["b", "c", "d"]),
      b: declareStore(StoreBase, ["c", "a"]),
      c: declareStore(StoreBase, []),
      d: declareStore(StoreBase, ["e"]),
      e: declareStore(StoreBase, ["a"])
    });

    expect(cycleList).toEqual([
      new Set(["a", "b"]),
      new Set(["a", "d", "e"]),
    ]);
  });
});
