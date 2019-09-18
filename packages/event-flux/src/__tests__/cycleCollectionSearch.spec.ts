import searchCycleCollection from "../cycleCollectionSearch";
import { declareStore } from "../StoreDeclarer";
import StoreBase from "../StoreBase";

jest.useFakeTimers();

describe('cycleCollectionSearch', () => {
  
  test('should get the cycle list', () => {
    let cycleList = searchCycleCollection({
      a: declareStore(StoreBase, ["b", "c"]),
      b: declareStore(StoreBase, ["a"]),
      c: declareStore(StoreBase),
    });
    // expect(cycleList).toEqual([["a", "b"]]);
  });
 
  test('should get the cycle list', () => {
    let cycleList = searchCycleCollection({
      a: declareStore(StoreBase, ["b", "c"]),
      b: declareStore(StoreBase, ["c", "d"]),
      c: declareStore(StoreBase, ["b", "a"]),
      d: declareStore(StoreBase, ["a", "b", "c"])
    });
    console.log(cycleList)
    // expect(cycleList).toEqual([
    //   ["b", "c"],
    //   ["a", "b", "c"],
    //   ["a", "b", "d"],
    //   ["b", "d", "c"],
    //   ["a", "b", "d", "c"],
    //   ["b", "c"],
    //   ["a", "c"], 
    //   ["b", "d"]
    // ]);
  });
});
