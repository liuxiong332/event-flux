import React from 'react';
import Provider, { StoreContext } from './Provider';
import { findInList, pick, buildObserveStore } from './utils';
const shallowEqual = require('fbjs/lib/shallowEqual');

function getStateKeyFromStores(stores) {
  return stores.map(store => {
    let name = tore.constructor.name;
    return name[0].toLowerCase() + name.slice(1);
  });
}

function pickStores(appStore, storeCls) {
  let stores = appStore.stores;
  let resStores = {};
  storeCls.forEach(cls => {
    let resStore = findInList(stores, (store) => store instanceof cls);
    let storeKey = resStore.constructor.getStoreKey();
    if (!resStore) {
      console.warn(`The store ${cls.name} cannot find in parent context, will create in air`);
      resStore = buildObserveStore(appStore, cls);
      stores[storeKey] = resStore;
    }
    resStores[storeKey] = resStore;
  });
  return resStores;
}

class SubProvider extends React.PureComponent {
  static getDerivedStateFromProps(nextProps, prevState) {
    let { _appStore, stores, state, storeClasses } = nextProps;  
    let derivedStores = prevState.stores || pickStores(appStore, storeClasses);
    let stateKeys = getStateKeyFromStores(derivedStores);
    let newState = pick(state, stateKeys);
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

export function withProvider(storeClasses) {
  return function(props) {
    let child = React.Children.only(props.children);
    return (
      <StoreContext.Consumer>
        {value => value ? 
          <SubProvider {...value} storeClasses={storeClasses}>{child}</SubProvider> :
          <Provider stores={storeClasses}>{child}</Provider>}
      </StoreContext.Consumer>
    );
  }
}