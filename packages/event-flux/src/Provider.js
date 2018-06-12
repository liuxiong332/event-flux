import React from 'react';
import AppStore from './AppStore';

export const StoreContext = React.createContext('event-flux');
const ContextProvider = StoreContext.Provider;

export default class Provider extends React.PureComponent {
  constructor(props) {
    super(props);
    let inStores = props.stores;
    if (!Array.isArray(inStores)) {
      inStores = [inStores];
    } 
    this.appStore = new AppStore(inStores, this.stateChanged);
    this.state = { 
      _appStore: this.appStore, 
      stores: this.appStore.stores, 
      state: this.appStore.state, 
    };
  }

  componentDidMount() {
    this.appStore.init();
  }

  stateChanged = (state) => {
    this.setState({ state });
  };

  render() {
    return (
      <ContextProvider value={this.state}>
        {React.Children.only(this.props.children)}
      </ContextProvider>
    );
  }
}
