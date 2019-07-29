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