import AppStore  from '../AppStore';
import StoreBase from '../StoreBase';
import { declareStore } from '../StoreDeclarer';
import * as React from 'react';
import { mount, shallow } from 'enzyme';
import { Provider } from '..';
import withEventFlux, { transformDefArgs, processState, StoreDefineObj } from '../withEventFlux';
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
  test("transformDefArgs behave correctly", () => {
    let storeDef: StoreDefineObj = {
      store1: ["state1", "state2"], 
      store2: ["state3", "state2"],
    };
    expect(transformDefArgs([storeDef])).toEqual([
      ["store1", ["state1", "state2"], null],
      ["store2", ["state3", "state2"], null]
    ]);

    expect(transformDefArgs([
      ["store1", ["state1", "state2"]],
      ["store2", ["state3", "state2"]],
    ])).toEqual([
      ["store1", ["state1", "state2"], null],
      ["store2", ["state3", "state2"], null]
    ]);

    const store1Gen = (state: any) => state;
    expect(transformDefArgs([
      ["store1", store1Gen],
    ])).toEqual([
      ["store1", store1Gen, null],
    ]);
  });

  test("processState behave correctly", () => {
    expect(processState({ a: 1, b: 2}, ["a", "b"])).toEqual({ a: 1, b: 2 });
    expect(processState({ a: 1, b: 2}, (state: any) => ({ a: state.a }) )).toEqual({ a: 1 });
    expect(processState({ a: 1, b: { c: 2 } }, ["a", "b.c"])).toEqual({ a: 1, c: 2 });
  });

  test('can get the appStore and stores', () => {
    let appStore = new AppStore();
    appStore.registerStore(declareStore(TodoStore, { stateKey: 'todo1', storeKey: "todo1Store" }));
    appStore.registerStore(declareStore(TodoStore, { stateKey: 'todo12', storeKey: "todo2Store" }));
    appStore.init();
    appStore.setRecycleStrategy(RecycleStrategy.Urgent);

    let propInvoker: any[] = [];
    function MyView(props: any) {
      propInvoker.push(props);
      return <div />;
    }
    const MyViewWrap = withEventFlux(["todo1Store", ["state1", "state2"]])(MyView);
    const MyViewWrap2 = withEventFlux(["todo2Store", (state: any) => ({ state1: state.state1, state2: state.state2 })])(MyView);

    function Fixture() {
      return (
        <Provider appStore={appStore}>
          <div>
            <MyViewWrap />
            <MyViewWrap2 />
          </div>
        </Provider>
      );
    }
    
    const wrapper = mount(<Fixture />); // mount/render/shallow when applicable
    // let todoStore = new StoreBase(appStore);
    expect(Object.keys(propInvoker[0])).toEqual(["todo1Store", "state1", "state2"]);
    expect(Object.keys(propInvoker[1])).toEqual(["todo2Store", "state1", "state2"]);

    appStore.setState({ todo1: { state1: "hello", state2: "hello" } });
    expect(propInvoker[2]).toBeFalsy();
    jest.runAllTimers();
    expect(Object.keys(propInvoker[2])).toEqual(["todo1Store", "state1", "state2"]);
    expect(propInvoker[2].state1).toBe("hello");

    wrapper.unmount();
    expect(appStore.stores).toEqual({});
  });
});
