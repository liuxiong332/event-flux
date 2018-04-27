import React from 'react';
import Provider, { StoreContext } from '../src/Provider';
import renderer from 'react-test-renderer';
import StoreBase from '../src/StoreBase';

class TodoDep1Store extends StoreBase {}

class Todo2Store extends StoreBase {
  static dependencies = [TodoDep1Store];
  constructor() {
    super();
    this.state = { todo2: 'todo2' };
  }
}

class ProviderTester {
  render() {
    return (
      <Provider stores={[Todo2Store]}>
        <StoreContext.Consumer>
          {value => this.getValue(value) && value}
        </StoreContext.Consumer>
      </Provider>
    )
  }
}

jest.useFakeTimers();

test('Provider', () => {
  let tester = new ProviderTester();
  tester.getValue = jest.fn();
  renderer.create(tester.render());
  expect(tester.getValue).toHaveBeenCalledTimes(1);
  // expect(tester.getValue.mock.calls[0][0].keys)
  expect(tester.getValue.mock.calls[0][0].state).toEqual({ todo2: { todo2: 'todo2' }, todoDep1: {} });
  let stores = tester.getValue.mock.calls[0][0].stores;
  expect(Object.keys(stores)).toEqual(['todo2Store', 'todoDep1Store']);

  stores.todo2Store.setState({ hello: 'world' });
  jest.runAllTimers();
  expect(tester.getValue.mock.calls[1][0].state).toEqual({ 
    todo2: { todo2: 'todo2', hello: 'world' }, todoDep1: {} 
  });  
});