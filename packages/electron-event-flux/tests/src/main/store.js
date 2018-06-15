import StoreBase from '../../../src/FluxStoreBase';
import MainAppStore from '../../../src/MainAppStore';
import { declareStore, declareStoreMap, declareStoreList } from '../../../src/StoreDeclarer';

class Todo3Store extends StoreBase {
  constructor() {
    super();
    this.state = { size: 0 };
  }

  addSize() {
    this.setState({ size: this.state.size + 1 });
  }

  decreaseSize() {
    this.setState({ size: this.state.size - 1 });
  }
}
Todo3Store.stateKey = 'todo3';

class Todo2Store extends StoreBase {
  constructor() {
    super();
    this.state = { size: 0, todo3List: [], todo3Map: {} };
  }

  init() {
    super.init();
    this.todo3StoreList.setSize(1);
    this.todo3StoreMap.add('myKey');
    // this.todo3Store = this.buildStore(Todo3Store);
    // this.todo3Store.observe((state) => {
    //   this.setState({ todo3: state });
    // });

    // this.todo3StoreList = [this.buildStore(Todo3Store)];
    // this.todo3StoreList.map((store, i) => {
    //   store.observe(state => this.setState({
    //     todo3List: [
    //       ...this.state.todo3List.slice(0, i), 
    //       state,
    //       ...this.state.todo3List.slice(i + 1), 
    //     ]
    //   }));
    // });

    // this.todo3StoreMap = { myKey: this.buildStore(Todo3Store) };
    // Object.keys(this.todo3StoreMap).forEach(key => {
    //   this.todo3StoreMap[key].observe(state => this.setState({
    //     todo3Map: { ...this.state.todo3Map, [key]: state }
    //   }));
    // });
  }

  addSize() {
    this.setState({ size: this.state.size + 1 });
  }

  decreaseSize() {
    this.setState({ size: this.state.size - 1 });
  }
}
Todo2Store.stateKey = 'todo2';
Todo2Store.innerStores = {
  todo3: declareStore(Todo3Store),
  todo3List: declareStoreList(Todo3Store, { storeKey: 'todo3StoreList' }),
  todo3Map: declareStoreMap(Todo3Store, { storeKey: 'todo3StoreMap' }),
};

class TodoStore extends StoreBase {
  constructor() {
    super();
    this.state = { count: 0 };
  }

  init() {
    // this.todo2Store = this.buildStore(Todo2Store);
    // this.todo2Store.observe((state) => {
    //   this.setState({ todo2: state });
    // });
    super.init();
  }

  addTodo(num) {
    this.setState({ count: this.state.count + num });
  }

  decreaseTodo(num) {
    this.setState({ count: this.state.count - num });
  }

  setComplete(isComplete) {
    this.setState({ isComplete });
  }
}
TodoStore.stateKey = 'todo';
TodoStore.innerStores = { todo2: declareStore(Todo2Store) };

const appStore = new MainAppStore([TodoStore]);
appStore.init();
export default appStore;