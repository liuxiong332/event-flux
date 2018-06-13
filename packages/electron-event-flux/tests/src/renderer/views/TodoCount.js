import React from 'react';
import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
  button: {
    margin: theme.spacing.unit,
  },
  input: {
    display: 'none',
  },
});

function CounterDemo({ state, store }) {
  let count = state.todo.count;
  const onClick = () => store.stores.todoStore.addTodo(1);
  return (
    <div>
      <Button color="primary" variant="contained" onClick={onClick}>INCREMENT {count}</Button>
    </div>
  );
}

export default {
  title: 'Todo Count Demo',
  Component: withStyles(styles)(CounterDemo),
};