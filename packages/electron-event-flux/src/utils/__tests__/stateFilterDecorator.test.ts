import { addStateFilter, addStateFilterForMap } from '../stateFilterDecorator';
import { Emitter } from 'event-kit';

class MockManagerStore {
  emitter = new Emitter();

  getClienIds() { 
    return [] 
  }

  addWin(clientId) {
    this.emitter.emit('add-win', clientId);
  }

  removeWin(clientId) {
    this.emitter.emit('remove-win', clientId);
  }

  onDidAddWin(callback) {
    return this.emitter.on('add-win', callback);
  }

  onDidRemoveWin(callback) {
    return this.emitter.on('remove-win', callback);
  }
}

let managerStore, Base1Class;

beforeEach(() => {
  managerStore = new MockManagerStore();
  Base1Class = class Base1Class {
    emitter = new Emitter();
    appStores = {
      winManagerStore: managerStore  
    };
    batchUpdater = {
      addTask: (fn) => { fn() }
    };

    getSubStoreInfos() { return []; }
    _initWrap() {}
  }
});

test('addStateFilter', () => {
  const Base1DeriveClass = addStateFilter(Base1Class);
  let base1Instance = new Base1DeriveClass();
  class Base2Class extends Base1Class {
    subStore = base1Instance;
    getSubStoreInfos() { return [[null, null, 'subStore', 'subState']]; }
  }

  let StateFilterClass = addStateFilter(Base2Class);
  let stateFilterInstance = new StateFilterClass();

  base1Instance._initWrap();
  stateFilterInstance._initWrap();
  managerStore.addWin('client1');
  expect(base1Instance._stateFilters).toEqual({ client1: { '*': false } });
  expect(stateFilterInstance._stateFilters).toEqual(
    { client1: { '*': false, subState: { '*': false } } }
  );

  let filterFn = jest.fn();
  stateFilterInstance.emitter.on('did-filter-update', filterFn);
  base1Instance.listen('client1');
  expect(stateFilterInstance._stateFilters).toEqual(
    { client1: { '*': false, subState: { '*': true } } }
  );
  expect(filterFn).toHaveBeenCalledWith({ 
    clientId: 'client1', filters: { '*': false, subState: { '*': true } }  
  });

  stateFilterInstance.listen('client1');
  expect(stateFilterInstance._stateFilters).toEqual(
    { client1: { '*': true, subState: { '*': true } } }
  );
  expect(filterFn).toHaveBeenCalledWith({
    clientId: 'client1', filters: { '*': true, subState: { '*': true } }  
  });

  stateFilterInstance.unlisten('client1');
  expect(stateFilterInstance._stateFilters).toEqual(
    { client1: { '*': false, subState: { '*': true } } }
  );
});

test('addStateFilterForMap', () => {
  const Base1DeriveClass = addStateFilter(Base1Class);
  let base1Instance = new Base1DeriveClass();
  let base2Instance = new Base1DeriveClass();
  class Base2Class extends Base1Class {
    storeMap = new Map([['item1', base1Instance], ['item2', base2Instance]]);
  }

  let StateFilterClass = addStateFilterForMap(Base2Class);
  let stateFilterInstance = new StateFilterClass();

  base1Instance._initWrap();
  base2Instance._initWrap();
  stateFilterInstance._initWrap();
  managerStore.addWin('client1');
  expect(stateFilterInstance._stateFilters).toEqual({ client1: { '*': false } });

  let filterFn = jest.fn();
  stateFilterInstance.emitter.on('did-filter-update', filterFn);

  base1Instance.listen('client1');
  base2Instance.listen('client1');
  stateFilterInstance.listenForKeys('client1', 'item1');
  expect(stateFilterInstance._stateFilters).toEqual({ client1: { '*': false, item1: { '*': true } } });
  expect(filterFn).toHaveBeenCalledWith({ clientId: 'client1', filters: { '*': false, item1: { '*': true } } });

  stateFilterInstance.listenForKeys('client1', 'item2');
  expect(stateFilterInstance._stateFilters).toEqual({ 
    client1: { '*': false, item1: { '*': true }, item2: { '*': true } } 
  });

  stateFilterInstance.unlistenForKeys('client1', 'item2');
  expect(stateFilterInstance._stateFilters).toEqual({ 
    client1: { '*': false, item1: { '*': true }, item2: false } 
  });

  base1Instance.unlisten('client1');
  expect(stateFilterInstance._stateFilters).toEqual({ 
    client1: { '*': false, item1: { '*': false }, item2: false } 
  });
});