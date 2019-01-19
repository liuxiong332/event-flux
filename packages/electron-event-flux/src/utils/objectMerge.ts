import { List, Map } from 'immutable';
const isObject = require('lodash/isObject');
const keys = require('lodash/keys');
const union = require('lodash/union');
// const { deserialize } = require('json-immutable');

const isShallow = (val) => Array.isArray(val) || !isObject(val) || List.isList(val);

export default function objectMerge(origin, updated, deleted) {
  /**
   * origin is shallow
   * origin is not shallow, updated is shallow and deleted is deleted is empty(NO Update and No Delete)
   */
  if (isShallow(origin) || (isShallow(updated) && !isObject(deleted))) {
    return updated;
  }

  if (Map.isMap(origin)) {
    let merged, deleteKeys = [];
    // deleted = isObject(deleted) ? deleted : {};
    merged = origin.withMutations(map => {
      keys(deleted).forEach(key => {
        if (deleted[key] === true) {
          map.delete(JSON.parse(key))
        } else {
          deleteKeys.push(key);
        }
      });
      union(keys(updated), deleteKeys).forEach(key => {
        let originKey = JSON.parse(key);
        map.set(originKey, objectMerge(origin.get(originKey), updated && updated[key], deleted && deleted[key]));
      });
    });
    return merged;
  } else {
    let merged, deleteKeys;
    if (isObject(deleted)) {
      merged = {};
      keys(origin).forEach(key => {
        if (deleted[key] !== true) merged[key] = origin[key];
      });
      deleteKeys = keys(deleted).filter(d => deleted[d] !== true)
    } else {
      merged = { ...origin };
    }
    union(keys(updated), deleteKeys).forEach(key => {
      merged[key] = objectMerge(origin[key], updated && updated[key], deleted && deleted[key])
    });
    return merged;
  }
};
