import AppStore  from '../AppStore';
import StoreBase from '../StoreBase';
import { declareStore } from '../StoreDeclarer';
import * as React from 'react';
import { mount, shallow } from 'enzyme';

jest.useFakeTimers();

describe('withEventFlux', () => {
  
  test('can get the appStore and stores', () => {
    let appStore = new AppStore();
    appStore.registerStore(declareStore(StoreBase, { stateKey: 'todo1', storeKey: "todo1Store" }));
    appStore.init();

    function Fixture() {
      return (
        <div>
          <input id="checked" defaultChecked />
          <input id="not" defaultChecked={false} />
          <input id="tertiary" defaultChecked checked={false} />
        </div>
      );
    }
    
    const wrapper = mount(<Fixture />); // mount/render/shallow when applicable
    
    expect(wrapper.find('#checked')).toBeChecked();
    expect(wrapper.find('#not')).not.toBeChecked();
    // let todoStore = new StoreBase(appStore);
     
  });
 
});
