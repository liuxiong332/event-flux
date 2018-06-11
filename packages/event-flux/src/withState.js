import React from 'react';
import Provider, { StoreContext } from './Provider';
import { pick } from './utils';

const notUsed = () => null;
function unifySelector(selector) {
  if (!selector) return notUsed;
  if (typeof selector !== 'function') {
    if (!Array.isArray(selector)) selector = [selector];
    return (state) => pick(state, selector); 
  }
  return selector;
}

export default function withState(storeSelector, stateSelector) {
  storeSelector = unifySelector(storeSelector);
  stateSelector = unifySelector(stateSelector);
  return function(Component) {

    return function(props) {
      return (
        <StoreContext.Consumer>
          {value => <Component {...props} {...storeSelector(value.stores)} {...stateSelector(value.state)}/>}
        </StoreContext.Consumer>
      );
    }
  }
}