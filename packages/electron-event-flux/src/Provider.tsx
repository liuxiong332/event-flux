import React from 'react';

export const StoreContext = React.createContext('electron-event-flux');
const ContextProvider = StoreContext.Provider;

export default class Provider extends React.PureComponent<any, any> {
  appStore: any;
  
  constructor(props) {
    super(props);
    this.appStore = props.appStore;
    this.appStore.onChange = this.handleStateChange;
    this.state = { 
      _appStore: this.appStore, 
      stores: this.appStore.stores, 
      state: this.appStore.state, 
    };
  }
  
  handleStateChange = (state) => {
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
