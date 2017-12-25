import { connectS } from './connect';

/**
 * higher order component that injects stores to a child.
 * takes either a varargs list of strings, which are stores read from the context,
 * or a function that manually maps the available stores from the context to props:
 * storesToProps(mobxStores, props, context) => newProps
 * mapStoresToProps: fn(stores, nextProps) or ...storeNames
 */
export default function inject(...mapStoreToProps) {
  if (typeof mapStoreToProps === "function" || Array.isArray(mapStoreToProps)) {
    return connectS(null, mapStoreToProps);
  }
  return connectS(null, [...arguments]);
}