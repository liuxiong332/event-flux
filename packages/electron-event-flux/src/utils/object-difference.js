/*
  Takes the old and the new version of an immutable object and
  returns a hash of what has updated (added or changed) in the object
  and what has been deleted in the object (with the entry that has
  been deleted given a value of true).

  ex: objectDifference({a: 1}, {b: 2}) would return
    {updated: {b: 2}, deleted: {a: true}}
*/

const isObject = require('lodash/isObject');
const isEmpty = require('lodash/isEmpty');
const keys = require('lodash/keys');
const { Map, List } = require('immutable');

const isShallow = val => Array.isArray(val) || !isObject(val) || List.isList(val);

const isDiffType = (val1, val2) => (Map.isMap(val1) && !Map.isMap(val2)) || (!Map.isMap(val1) && Map.isMap(val2));

function checkUpdateVal(key, oldVal, currVal, updated, deleted) {
  if (currVal === oldVal) return;
  
  if (isShallow(currVal) || isShallow(oldVal)) {
    updated[key] = currVal;
  } else if (isDiffType(currVal, oldVal)) {
    updated[key] = currVal;
  } else {
    const diff = objectDifference(oldVal, currVal);
    !isEmpty(diff.updated) && (updated[key] = diff.updated);
    !isEmpty(diff.deleted) && (deleted[key] = diff.deleted);
  }
}

function objectDifference(old, curr) {
  const updated = {};
  const deleted = {};

  if (Map.isMap(old) && Map.isMap(curr)) {
    curr.forEach((val, key) => checkUpdateVal(key, old.get(key), val, updated, deleted));
    old.forEach((val, key) => curr.get(key) === undefined && (deleted[key] = true));
  } else {
    keys(curr).forEach(key => checkUpdateVal(key, old[key], curr[key], updated, deleted));
    keys(old).forEach(key => curr[key] === undefined && (deleted[key] = true));
  }
  return { updated, deleted };
};

module.exports = objectDifference;