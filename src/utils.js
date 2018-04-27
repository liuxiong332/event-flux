export function findInList(list, func) {
  let len = list.length;
  for (let i = 0; i < len; ++i) {
    if (func(list[i])) return list[i];
  }
}

export function findInObject(obj, func) {
  for (let key in obj) {
    if (func(obj[key])) return obj[key];
  }
}

export function pick(obj, keys) {
  let resObj = {};
  for(let key of keys) {
    if (key in obj) {
      resObj[key] = obj[key];      
    }
  }
  return resObj;
}