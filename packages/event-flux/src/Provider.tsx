import * as React from 'react';
import { DisposableLike } from 'event-kit';
import AppStore from './AppStore';
import DispatchItem from './DispatchItem';

interface ContextValue {
  _appStore: AppStore | undefined;
  stores: { [storeKey: string]: DispatchItem };
  state: any; 
}

interface ProviderProps {
  appStore: AppStore;
}

export const StoreContext = React.createContext<ContextValue>({ _appStore: undefined, stores: {}, state: {} });
const ContextProvider = StoreContext.Provider;

export default class Provider extends React.PureComponent<ProviderProps, ContextValue> {
  disposable: DisposableLike;

  constructor(props: ProviderProps) {
    super(props);
    const appStore = props.appStore;
    this.disposable = appStore.onDidChange(this.handleStateChange);
    this.state = { 
      _appStore: appStore, 
      stores: appStore.stores, 
      state: appStore.state, 
    };
  }
  
  handleStateChange = (state: any) => {
    this.setState({ state });
  };

  componentWillUnmount() {
    this.disposable.dispose();
  }

  render() {
    return (
      <ContextProvider value={this.state}>
        {React.Children.only(this.props.children)}
      </ContextProvider>
    );
  }
}
