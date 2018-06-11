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
  return function MyView() {
    return (
      <StoreContext.Consumer>
        {value => getValue(value) || <div />}
      </StoreContext.Consumer>
    );
  }
}

jest.useFakeTimers();

describe('withProvider', () => {
  test('has parent provider', () => {
    let getValue = jest.fn();
    let WrapProvider = withProvider([Todo2Store, TodoDep1Store])(injectView(getValue));
    renderer.create(
      <Provider stores={[Todo2Store]}>
        <WrapProvider />
      </Provider>
    );
    jest.runAllTimers();    
    expect(getValue.mock.calls[getValue.mock.calls.length - 1][0].state).toEqual({ 
      todo2: { todo2: 'todo2' }, todoDep1: { status: 'hasinit' } 
    });
  });

  test('no parent provider', () => {
    let getValue = jest.fn();
    let WrapProvider = withProvider([TodoDep1Store])(injectView(getValue));
    renderer.create(
      <WrapProvider />
    );
    jest.runAllTimers();
    expect(getValue.mock.calls[getValue.mock.calls.length - 1][0].state).toEqual({ 
      todoDep1: { status: 'hasinit' } 
    });    
  });
});