import React from 'react';
import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
  root: {
    '& > *': {
      margin: theme.spacing.unit,
    }
  },
});

function CounterDemo({ state, store, classes }) {
  let { count, isComplete } = state.todo;
  let { todo4Map, todo4List } = state.todo.todo2.todo4;
  const onClick = () => store.stores.todoStore.addTodo(1);
  const onClick2 = () => store.stores.todoStore.setComplete(isComplete ? undefined : true);
  const onClick3 = () => store.stores.todoStore.todo2Store.todo4Store.addKey(Math.random().toString(), 0);
  const onClick4 = () => store.stores.todoStore.todo2Store.todo4Store.increase();
  return (
    <div className={classes.root}>
      <Button color="primary" variant="contained" onClick={onClick}>INCREMENT {count}</Button>
      <Button color="primary" variant="contained" onClick={onClick2}>Complete {isComplete ? 'Yes' : 'No'}</Button>
      <Button color="primary" variant="contained" onClick={onClick3}>Immutable Map {todo4Map.size}</Button>
      <Button color="primary" variant="contained" onClick={onClick4}>Immutable List {todo4List.size}</Button>
    </div>
  );
}

export default {
  title: 'Todo Count Demo',
  Component: withStyles(styles)(CounterDemo),
};