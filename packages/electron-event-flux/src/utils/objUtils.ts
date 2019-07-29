export function isEmpty(object: Object | null | undefined) {
  if (object == null) {
    return true;
  }

  for (let key in object) {
    return false;
  }
  return true;
}

export function isObject(object: any) {
  return object != null && typeof object === "object";
}

export function isFunction(object: any) {
  return typeof object === 'function';
}

export function pick(obj: { [key: string]: any }, keys: string[]) {
  let resObj: { [key: string]: any } = {};
  for(let key of keys) {
    if (key in obj) {
      resObj[key] = obj[key];
    }
  }
  return resObj;
}