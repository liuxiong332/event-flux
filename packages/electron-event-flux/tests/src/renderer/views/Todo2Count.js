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

function Todo2Demo({ state, store, classes }) {
  let { size } = state.todo.todo2;
  const onClick = () => store.stores.todoStore.todo2Store.addSize();
  const onClick2 = () => store.stores.todoStore.todo2Store.decreaseSize();
  return (
    <div className={classes.root}>
      <Button color="primary" variant="contained" onClick={onClick}>Add Size {size}</Button>
      <Button color="primary" variant="contained" onClick={onClick2}>Decrease Size {size}</Button>
    </div>
  );
}

export default {
  title: 'Todo2 embed Count Demo',
  Component: withStyles(styles)(Todo2Demo),
};