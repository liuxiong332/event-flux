import StoreBase from 'event-flux/lib/StoreBase';
import { declareStore, declareStoreMap, declareStoreList } from 'electron-event-flux/lib/StoreDeclarer';
import storage from './storage';

function isDefined(s) {
  return typeof s !== 'undefined';
}

class Todo3Store extends StoreBase {
  constructor() {
    super();
    this.state = { size: 0 };
  }

  willInit() {
    console.log('todo3, willInit', this.mapStoreKey, this.listStoreKey);
    let storeKey = 'todo3'; 
    if (isDefined(this.mapStoreKey)) {
      storeKey = this.mapStoreKey;
    } else if (isDefined(this.listStoreKey)) {
      storeKey = this.listStoreKey;
    }
    this.storage = this.parentStore.storage.getNSStore(storeKey);
    this.setState({
      size: this.storage.get('size') || 0,
    });
  }

  addSize() {
    let newSize = this.state.size + 1;
    this.setState({ size: newSize });
    this.storage.set('size', newSize);
    return newSize;
  }

  decreaseSize() {
    let newSize = this.state.size - 1;
    this.setState({ size: newSize });
    this.storage.set('size', newSize);
    return newSize;
  }
}

class Todo2Store extends StoreBase {
  constructor() {
    super();
    this.state = { size: 0, todo3List: [], todo3Map: {} };
  }

  willInit() {
    console.log('todo2, willInit');
    this.storage = this.parentStore.storage.getNSStore('todo2');
    this.setState({
      size: this.storage.get('size') || 0,
    });
  }

  addSize() {
    this.setState({ size: this.state.size + 1 });
    this.storage.set('size', this.state.size + 1);
  }

  decreaseSize() {
    this.setState({ size: this.state.size - 1 });
    this.storage.set('size', this.state.size - 1);
  }
}
Todo2Store.innerStores = {
  todo3: declareStore(Todo3Store),
  todo3List: declareStoreList(Todo3Store, { storeKey: 'todo3StoreList', size: 1 }),
  todo3Map: declareStoreMap(Todo3Store, { storeKey: 'todo3StoreMap', keys: ['myKey'] }),
};

class TodoStore extends StoreBase {
  constructor() {
    super();
    this.state = { count: 0 };
  }

  willInit() {
    let clientId = this.parentStore.clientId;
    console.log('clientId:', clientId);
    this.storage = clientId ? storage.getNSStore(clientId) : storage; 
    this.setState({
      count: this.storage.get('count') || 0,
      isComplete: this.storage.get('isComplete'),
    });
  }

  addTodo(num) {
    this.setState({ count: this.state.count + num });
    this.storage.set('count', this.state.count + num);
  }

  decreaseTodo(num) {
    this.setState({ count: this.state.count - num });
    this.storage.set('count', this.state.count - num);
  }

  setComplete(isComplete) {
    console.log('set complete:', isComplete)
    this.setState({ isComplete });
    this.storage.set('isComplete', isComplete);
  }
}
TodoStore.innerStores = { todo2: declareStore(Todo2Store) };

export default TodoStore;