const React = require('react');

export const StoreContext = React.createContext('event-flux');
const AppStore = require('./AppStore');
const StoreBase = require('./StoreBase');

export default class Provider extends React.PureComponent {
  constructor(props) {
    super(props);
    let stores = [];
    let inStores = props.stores;
    if (!Array.isArray(inStores)) {
      inStores = [inStores];
      inStores.forEach(store => {
        let resStore = this.parseStore(store);
        resStore && stores.push(resStore);
      })
    } else {
      let resStore = this.parseStore(store);
      resStore && stores.push(resStore);
    }
    this.appStore = new AppStore(stores, this.stateChanged);
    this.state = { 
      _appStore: this.appStore, 
      stores: this.appStore.stores, 
      state: this.appStore.state 
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
      <StoreContext.Provider value={this.state}>
        {React.Children.only(this.props.children)}
      </StoreContext.Provider>
    );
  }
}
