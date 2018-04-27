import React from 'react';
import Provider, { StoreContext } from '../src/Provider';
import renderer from 'react-test-renderer';
import StoreBase from '../src/StoreBase';
import withProvider from '../src/withProvider';

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
  return function(props) {
    getValue(props);
    return <div />;
  }
}

jest.useFakeTimers();

describe('withProvider', () => {
  // test('has parent provider', () => {
  //   let getValue = jest.fn();
  //   renderer.create(
  //     <Provider stores={[Todo2Store]}>
  //       {withProvider([Todo2Store, TodoDep1Store])(injectView(getValue))}
  //     </Provider>
  //   );
  //   console.log(getValue.mock.calls[0][0].state);
  //   expect(getValue.mock.calls[0][0].state).toEqual({ 
  //     todo2: { todo2: 'todo2' }, todoDep1: { status: 'hasinit' } 
  //   });
  // });

  test('no parent provider', () => {
    let getValue = jest.fn();
    renderer.create(
      withProvider([TodoDep1Store])(injectView(getValue))
    );
    console.log(getValue.mock.calls[0][0].state);    
    expect(getValue.mock.calls[0][0].state).toEqual({ todoDep1: { status: 'hasinit' } });    
  });
});