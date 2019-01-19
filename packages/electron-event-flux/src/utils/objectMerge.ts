import { List, Map } from 'immutable';
const isObject = require('lodash/isObject');
const keys = require('lodash/keys');
// const { deserialize } = require('json-immutable');

const isShallow = (val) => Array.isArray(val) || !isObject(val) || List.isList(val);

export default function objectMerge(origin, updated, deleted) {
  if (isShallow(origin) || isShallow(updated)) {
    return updated;
  }
  if (Map.isMap(origin)) {
    let merged;
    deleted = isObject(deleted) ? deleted : {};
    merged = origin.withMutations(map => {
      keys(deleted).forEach(key => map.delete(JSON.parse(key)));
      keys(updated).forEach(key => {
        let originKey = JSON.parse(key);
        map.set(originKey, objectMerge(origin.get(originKey), updated[key], deleted && deleted[key]));
      });
    });
    return merged;
  } else {
    let merged = {};
    if (isObject(deleted)) {
      merged = {};
      keys(origin).forEach(key => {
        if (deleted[key] !== true) merged[key] = origin[key];
      });
    } else {
      merged = { ...origin };
    }
    keys(updated).forEach(key => {
      merged[key] = objectMerge(origin[key], updated[key], deleted && deleted[key])
    });
    return merged;
  }
};
