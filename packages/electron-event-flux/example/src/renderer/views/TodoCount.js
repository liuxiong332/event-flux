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
  const onClick = () => store.stores.todoStore.addTodo(1);
  const onClick2 = () => store.stores.todoStore.setComplete(isComplete ? undefined : true);
  return (
    <div className={classes.root}>
      <Button color="primary" variant="contained" onClick={onClick}>INCREMENT {count}</Button>
      <Button color="primary" variant="contained" onClick={onClick2}>Complete {isComplete ? 'Yes' : 'No'}</Button>
    </div>
  );
}

export default {
  title: 'Todo Count Demo',
  Component: withStyles(styles)(CounterDemo),
};