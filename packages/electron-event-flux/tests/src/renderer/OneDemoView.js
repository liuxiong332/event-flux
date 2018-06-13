import React from 'react';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
  title: {
    height: 36,
    lineHeight: '36px',
    'border-bottom': '1px solid #F4F4F5',
  },
  view: {
    textAlign: 'center',
    padding: 8,
  },
});

function OneDemoView({ title, Component, state, store, classes }) {
  return (
    <div>
      <Typography variant="title" color="inherit" className={classes.title}>
        {title}
      </Typography>
      <div className={classes.view}>
        <Component state={state} store={store}/>
      </div>
    </div>
  );
}

export default withStyles(styles)(OneDemoView);