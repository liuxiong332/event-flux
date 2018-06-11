import React from 'react';
import Provider, { StoreContext } from '../src/Provider';
import renderer from 'react-test-renderer';
import StoreBase from '../src/StoreBase';
import withState from '../src/withState';

class TodoDep1Store extends StoreBase {
  init() {
    this.setState({ status: 'hasinit' });
  }
}

class Todo2Store extends StoreBase {
  constructor() {
    super();
    this.state = { todo2: 'todo2' };
  }
}

function injectView(getValue) {
  function MyView(props) {
    getValue(props);
    return <div />;
  }
  return MyView;
}

jest.useFakeTimers();

describe('withState', () => {
  test('store and state all in', () => {
    let getValue = jest.fn();
    let MyView = injectView(getValue);
    let View = withState(['todoDep1Store', 'todo2Store'], ['todoDep1'])(MyView);
    renderer.create(
      <Provider stores={[Todo2Store, TodoDep1Store]}>
        <View />
      </Provider>
    );
    jest.runAllTimers();    
    let lastCall = getValue.mock.calls[getValue.mock.calls.length - 1];
    expect(Object.keys(lastCall[0])).toEqual(['todoDep1Store', 'todo2Store', 'todoDep1']);
    expect(lastCall[0].todoDep1).toEqual({ status: 'hasinit' });
  });

  test('store or state is null', () => {
    let getValue = jest.fn();
    let MyView = injectView(getValue);
    let View = withState(null, ['todoDep1'])(MyView);
    renderer.create(
      <Provider stores={[Todo2Store, TodoDep1Store]}>
        <View />
      </Provider>
    );
    jest.runAllTimers();    
    let lastCall = getValue.mock.calls[getValue.mock.calls.length - 1];
    expect(Object.keys(lastCall[0])).toEqual(['todoDep1']);
    expect(lastCall[0].todoDep1).toEqual({ status: 'hasinit' });
  })
  
});