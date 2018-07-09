const isObject = require('lodash/isObject');
const keys = require('lodash/keys');
const { List, Map } = require('immutable');
const { deserialize } = require('json-immutable');

const isShallow = (val) => Array.isArray(val) || !isObject(val) || List.isList(val);

module.exports = function objectMerge(origin, updated, deleted) {
  if (isShallow(origin) || isShallow(updated)) {
    return updated;
  }
  if (Map.isMap(origin)) {
    let merged;
    if (isObject(deleted)) {
      merged = {};
      origin.forEach((val, key) => {
        if (deleted[key] !== true) merged[key] = val;
      });
    } else {
      merged = { ...origin };
    }
    keys(updated).forEach(key => {
      merged[key] = objectMerge(origin.get(key), updated[key], deleted && deleted[key])
    });
    return new Map(merged);
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
