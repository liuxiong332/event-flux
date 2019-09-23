import AppStore  from '../AppStore';
import StoreBase from '../StoreBase';
import { declareStore } from '../StoreDeclarer';
import * as React from 'react';
import { mount, shallow } from 'enzyme';
import { Provider } from '..';
import useEventFlux from '../useEventFlux';
import DispatchParent from '../DispatchParent';
import RecycleStrategy from '../RecycleStrategy';

jest.useFakeTimers();

class TodoStore extends StoreBase<{ state1: string, state2: string }> {
  constructor(appStore: DispatchParent) {
    super(appStore);
    this.state = { state1: "state1", state2: 'todo2' };
  }
}

describe('withEventFlux', () => {
  
  test('can get the appStore and stores', () => {
    let appStore = new AppStore();
    appStore.registerStore(declareStore(TodoStore, { stateKey: 'todo1', storeKey: "todo1Store" }));
    appStore.registerStore(declareStore(TodoStore, { stateKey: 'todo12', storeKey: "todo2Store" }));
    appStore.init();
    appStore.setRecycleStrategy(RecycleStrategy.Urgent);

    let propInvoker: any[] = [];
    function MyView(props: any) {
      let todo1Props = useEventFlux(["todo1Store", ["state1", "state2"]]);
      expect(Object.keys(todo1Props)).toEqual(["todo1Store", "state1", "state2"]);

      let todo2Props = useEventFlux({ "todo2Store": ["state1", "state2"] });
      expect(Object.keys(todo2Props)).toEqual(["todo2Store", "state1", "state2"]);

      let todo3Props = useEventFlux({ "todo2Store": ({ state1 }) => ({ state1 }) });
      expect(Object.keys(todo3Props)).toEqual(["todo2Store", "state1"]);

      return <div />;
    } 

    function Fixture() {
      return (
        <Provider appStore={appStore}>
          <MyView />
        </Provider>
      );
    }
    
    const wrapper = mount(<Fixture />); // mount/render/shallow when applicable
     
    wrapper.unmount();
    expect(appStore.stores).toEqual({});
  });
});
