import objectDifference from '../objectDifference';
import objectMerge from '../objectMerge';
import { Map, List, is } from 'immutable';

test('base merge', () => {
  let sameObj = { hello: 'a' };
  let oldObj = { d: 'b', same: sameObj };
  let newObj = { m: 'b', same: sameObj };
  let { updated, deleted } = objectDifference(oldObj, newObj);
  let retObj = objectMerge(oldObj, updated, deleted); 
  expect(retObj).toEqual(newObj);
});

test('immutable diff', () => {
  let val1 = Map({ a: 2, b: 3 });
  let val2: Map<any, any> = Map({ a: 3, c: 4 });
  val2 = val2.set(10, 10);

  let { updated, deleted } = objectDifference(val1, val2);
  let retObj = objectMerge(val1, updated, deleted);
  expect(is(retObj, val2)).toBeTruthy();
  expect(retObj.get(10)).toBe(10);
});
