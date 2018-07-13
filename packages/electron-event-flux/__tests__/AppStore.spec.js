import StoreBase from 'event-flux/lib/StoreBase';
import { declareStore, declareStoreMap, declareStoreList } from '../src/StoreDeclarer';
import buildAppStore from '../src/MainAppStore';

class F1Store extends StoreBase {
  constructor() {
    super();
    this.state = { count: 0 };
  }

  add() {
    this.setState({ count: this.state.count + 1 });
  }
}

class F2Store extends StoreBase {
  constructor() {
    super();
    this.state = { size: 0 };
  }

  add() {
    this.setState({ size: this.state.size + 1 });
  }
}
F2Store.innerStores = {
  f1Key: declareStore(F1Store),
  f1ListKey: declareStoreList(F1Store),
  f1MapKey: declareStoreMap(F1Store),
}

test('Build simple app store', () => {
  let appStore = buildAppStore({ f2: F2Store });
  expect(appStore.state.f2.f1Key).toEqual({ count: 0 });
  expect(appStore.state.f2).toEqual({ size: 0, f1Key: { count: 0 }});
  appStore.stores.f2Store.add();
  expect(appStore.state.f2).toEqual({ size: 1, f1Key: { count: 0 }});
});

test('Build simple app store with List', () => {
  let appStore = buildAppStore({ f2: F2Store });
  appStore.stores.f2Store.f1ListKeyStore.add();
  console.log('Add List Result:', appStore.state.f2)
  // expect(appStore.state.f2).toEqual({ size: 1, f1Key: { count: 0 }});
});