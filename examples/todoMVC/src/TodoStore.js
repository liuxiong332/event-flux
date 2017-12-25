import { uuid, pluralize, store, extend } from './util';
import { StoreBase } from '../../..';

export default class TodoModel extends StoreBase {
  constructor(appStore, key) {
    super(appStore);
    this.state = { key, todos: store(key) };
  }

  addTodo(title) {
    let todos = this.state.todos.concat({
      id: uuid(),
      title: title,
      completed: false
    });
    this.setState({ todos });
  }

  toggleAll(checked) {
    // Note: it's usually better to use immutable data structures since they're
    // easier to reason about and React works very well with them. That's why
    // we use map() and filter() everywhere instead of mutating the array or
    // todo items themselves.
    let todos = this.state.todos.map(function (todo) {
      return extend({}, todo, {completed: checked});
    });
    this.setState({ todos });
  }

  toggle(todoToToggle) {
    let todos = this.state.todos.map(function (todo) {
      return todo !== todoToToggle ?
        todo :
        extend({}, todo, {completed: !todo.completed});
    });
    this.setState({ todos });
  }

  destroy(todo) {
    let todos = this.state.todos.filter(function (candidate) {
      return candidate !== todo;
    });
    this.setState({ todos });
  }

  save(todoToSave, text) {
    let todos = this.state.todos.map(function (todo) {
      return todo !== todoToSave ? todo : extend({}, todo, {title: text});
    });
    this.setState({ todos });
  }

  clearCompleted() {
    let todos = this.state.todos.filter(function (todo) {
      return !todo.completed;
    });
    this.setState({ todos });
  }
}
