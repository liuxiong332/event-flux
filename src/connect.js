import React from 'react';
import PropTypes from 'prop-types';

function isStateless(component) {
  // `function() {}` has prototype, but `() => {}` doesn't
  // `() => {}` via Babel has prototype too.
  return !(component.prototype && component.prototype.render);
}

const injectorContextTypes = {
  appStore: PropTypes.object
};
Object.seal(injectorContextTypes);

const proxiedInjectorProps = {
  contextTypes: {
    get: function () {
      return injectorContextTypes;
    },
    configurable: true,
    enumerable: false
  },
};

/**
 * Store Injection
 */
function createStoreInjector(mapStateToProps, grabStoresFn, component, injectNames) {
  let displayName = "inject-" + (component.displayName || component.name || (component.constructor && component.constructor.name) || "Unknown");
  if (injectNames) {
    displayName += "-with-" + injectNames;
  }

  class Injector extends React.PureComponent {
    static displayName = displayName;
    static wrappedComponent;

    storeRef = (instance) => { this.wrappedInstance = instance };

    componentWillMount() {
      if (mapStateToProps) {
        this.disposable = this.context.appStore.observe((newState) => {
          !this.isUnmount && this.setState({ appState: newState });
        });
      }
    }

    componentWillUnmount() {
      this.disposable && this.disposable.dispose();
      this.isUnmount = true;
    }

    render() {
      // Optimization: it might be more efficient to apply the mapper function *outside* the render method
      // (if the mapper is a function), that could avoid expensive(?) re-rendering of the injector component
      // See this test: 'using a custom injector is not too reactive' in inject.js
      let newProps = {};
      for (let key in this.props) if (this.props.hasOwnProperty(key)) {
        newProps[key] = this.props[key];
      }

      if (mapStateToProps) {
        var additionalProps = mapStateToProps(this.state.appState, newProps) || {};
        for (let key in additionalProps) {
          newProps[key] = additionalProps[key];
        }
      }

      if (grabStoresFn) {
        var additionalProps = grabStoresFn(this.context.appStore || {}, newProps, this.context) || {};
        for (let key in additionalProps) {
          newProps[key] = additionalProps[key];
        }
      }

      if (!isStateless(component)) {
        newProps.ref = this.storeRef;
      }
      
      return React.createElement(component, newProps);
    }
  }

  Injector.wrappedComponent = component;
  Object.defineProperties(Injector, proxiedInjectorProps);

  return Injector;
}


function grabStoresByName(storeNames) {
  return function (baseStores, nextProps) {
    let newProps = {};
    storeNames.forEach(function(storeName) {
      if (storeName in nextProps) // prefer props over stores
        return;
      if (!(storeName in baseStores))
        throw new Error("App injector: Store '" + storeName + "' is not available! Make sure it is provided by some Provider");
      newProps[storeName] = baseStores[storeName];
    });
    return newProps;
  }
}

function grapStateByName(stateNames) {
  return function(rootStates, nextProps) {
    let newProps = {};
    stateNames.forEach(function(stateName) {
      let names = stateName.split('.');
      let propName = names[names.length - 1];
      // prefer props over stores
      if (propName in nextProps)
        return;
      let stateVal = rootStates;
      for (let i = 0; i < names.length; ++i) {
        stateVal = stateVal[names[i]];
      }
      newProps[propName] = stateVal;
    });
    return newProps;
  }
}

/**
 * higher order component that injects stores to a child.
 * takes either a varargs list of strings, which are stores read from the context,
 * or a function that manually maps the available stores from the context to props:
 * storesToProps(mobxStores, props, context) => newProps
 * mapStoresToProps: fn(stores, nextProps) or ...storeNames
 */
export default function connect(mapStateToProps, mapStoreToProps) {
  return function(componentClass) {
    return createStoreInjector(mapStateToProps, mapStoreToProps, componentClass);
  };
}

export function connectS(stateMappers, storeMappers) {
  if (typeof stateMappers === 'string') {
    stateMappers = [stateMappers];
  }
  if (Array.isArray(stateMappers)) {
    stateMappers = grapStateByName(stateMappers);
  }

  if (typeof storeMappers === 'string') {
    storeMappers = [storeMappers];
  }
  let storeNames = [];
  if (Array.isArray(storeMappers)) {
    storeNames = storeMappers;
    storeMappers = grabStoresByName(storeMappers);
  }
  return function(componentClass) {
    return createStoreInjector(stateMappers, storeMappers, componentClass, storeNames.join("-"));
  };
}
