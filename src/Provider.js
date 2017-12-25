const React = require('react');
import PropTypes from 'prop-types';

export default class Provider extends React.PureComponent {
  static childContextTypes = {
    appStore: PropTypes.object
  };

  getChildContext() {
    return { appStore: this.appStore };
  }

  constructor(props) {
    super(props);
    this.appStore = props.appStore;
  }

  render() {
    return React.Children.only(this.props.children);
  }
}
