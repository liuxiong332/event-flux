import React from 'react';
import Provider, { StoreContext } from './Provider';
import { findInList, pick } from './utils';
import { buildObserveStore, getStateKey } from './buildStore';
import shallowEqual from 'fbjs/lib/shallowEqual';

function getStateKeyFromStores(stores) {
  if (!stores) return null;
  let keys = [];
  for (let key in stores) {
    keys.push(getStateKey(stores[key].constructor));
  }
  return keys;
}

function pickStores(appStore, storeCls) {
  let stores = appStore.stores;
  let resStores = {};
  storeCls.forEach(cls => {
    let resStore = findInList(stores, (store) => store instanceof cls);
    let storeKey = null;
    if (!resStore) {
      // console.warn(`The store ${cls.name} cannot find in parent context, will create in air`);
      resStore = buildObserveStore(appStore, cls);
      storeKey = getStoreKey(resStore.constructor);
      stores[storeKey] = resStore;
    } else {
      storeKey = getStoreKey(resStore.constructor);      
    }
    resStores[storeKey] = resStore;
  });
  return resStores;
}

class SubProvider extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    let { _appStore, stores, state, storeClasses } = nextProps;  
    let derivedStores = prevState.stores || pickStores(_appStore, storeClasses);
    let stateKeys = getStateKeyFromStores(derivedStores);
    let newState = null;
    if (state && stateKeys) {
      newState = pick(state, stateKeys);
    }
    return { _appStore, stores: derivedStores, state: newState };
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      this.state.stores !== nextState.stores ||       // Stores only init once and only render once
      // !shallowEqual(this.props.stores, nextProps.stores) ||
      // !shallowEqual(this.props.state, nextProps.state) ||      
      // !shallowEqual(this.state.stores, nextState.stores) ||
      !shallowEqual(this.state.state, nextState.state)   // render when state changed.
    );
  }

  render() {
    return (
      <StoreContext.Provider value={this.state}>
        {React.Children.only(this.props.children)}      
      </StoreContext.Provider>
    );
  }
}

export default function withProvider(storeClasses) {
  return function(Component) {
    return function(props) {
      let child = <Component {...props}/>;
      return (
        <StoreContext.Consumer>
          {value => value._appStore ? 
            <SubProvider 
              stores={value.stores} 
              state={value.state} 
              _appStore={value._appStore} 
              storeClasses={storeClasses}>
              {child}
            </SubProvider> :
            <Provider stores={storeClasses}>{child}</Provider>}
        </StoreContext.Consumer>
      );
    }
  }
}