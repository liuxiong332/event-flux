import React from 'react';
import TodoFooter from './TodoFooter';
import TodoItem from './TodoItem';
import { Router } from 'director/build/director';
import { connect } from '../../..';

const ALL_TODOS = 'all';
const ACTIVE_TODOS = 'active';
const COMPLETED_TODOS = 'completed';
const ENTER_KEY = 13;

class TodoApp extends React.PureComponent {
  constructor(props, context) {
    super(props);
    this.state = {
      nowShowing: ALL_TODOS,
      editing: null,
      newTodo: ''
    };
    this.todoStore = context.reeventApp.todoStore;
  }

  componentDidMount() {
    var setState = this.setState;
    var router = new Router({
      '/': setState.bind(this, {nowShowing: ALL_TODOS}),
      '/active': setState.bind(this, {nowShowing: ACTIVE_TODOS}),
      '/completed': setState.bind(this, {nowShowing: COMPLETED_TODOS})
    });
    router.init('/');
  }

  handleChange = (event) => {
    this.setState({newTodo: event.target.value});
  };

  handleNewTodoKeyDown = (event) => {
    if (event.keyCode !== ENTER_KEY) {
      return;
    }

    event.preventDefault();

    var val = this.state.newTodo.trim();

    if (val) {
      this.todoStore.addTodo(val);
      this.setState({newTodo: ''});
    }
  };

  toggleAll = (event) => {
    var checked = event.target.checked;
    this.todoStore.toggleAll(checked);
  };

  toggle = (todoToToggle) => {
    this.todoStore.toggle(todoToToggle);
  };

  destroy(todo) {
    this.todoStore.destroy(todo);
  }

  edit(todo) {
    this.setState({editing: todo.id});
  }

  save(todoToSave, text) {
    this.todoStore.save(todoToSave, text);
    this.setState({editing: null});
  }

  cancel = () => {
    this.setState({editing: null});
  };

  clearCompleted = () => {
    this.todoStore.clearCompleted();
  };

  render() {
    var footer;
    var main;
    var todos = this.state.todos;

    var shownTodos = todos.filter(function (todo) {
      switch (this.state.nowShowing) {
      case ACTIVE_TODOS:
        return !todo.completed;
      case COMPLETED_TODOS:
        return todo.completed;
      default:
        return true;
      }
    }, this);

    var todoItems = shownTodos.map(function (todo) {
      return (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={this.toggle.bind(this, todo)}
          onDestroy={this.destroy.bind(this, todo)}
          onEdit={this.edit.bind(this, todo)}
          editing={this.state.editing === todo.id}
          onSave={this.save.bind(this, todo)}
          onCancel={this.cancel}
        />
      );
    }, this);

    var activeTodoCount = todos.reduce(function (accum, todo) {
      return todo.completed ? accum : accum + 1;
    }, 0);

    var completedCount = todos.length - activeTodoCount;

    if (activeTodoCount || completedCount) {
      footer =
        <TodoFooter
          count={activeTodoCount}
          completedCount={completedCount}
          nowShowing={this.state.nowShowing}
          onClearCompleted={this.clearCompleted}
        />;
    }

    if (todos.length) {
      main = (
        <section className="main">
          <input
            className="toggle-all"
            type="checkbox"
            onChange={this.toggleAll}
            checked={activeTodoCount === 0}
          />
          <ul className="todo-list">
            {todoItems}
          </ul>
        </section>
      );
    }

    return (
      <div>
        <header className="header">
          <h1>todos</h1>
          <input
            className="new-todo"
            placeholder="What needs to be done?"
            value={this.state.newTodo}
            onKeyDown={this.handleNewTodoKeyDown}
            onChange={this.handleChange}
            autoFocus={true}
          />
        </header>
        {main}
        {footer}
      </div>
    );
  }
}

const mapStateToProps = (state) => state;
const mapStoreToProps = (appStore) => ({ todoStore: appStore.todoStore });
export default connect(mapStateToProps, mapStoreToProps)(TodoApp);