## event-flux

*event-flux* is the flux-like store management. It manage the complex links in those stores and make the view respond to the store change easy.

### How it run

*event-flux* contains the following objects:

* Store: the state container that like MVC's model.

* StoreApp: the store management container. It manage the life cycle of the stores and control the initialization sequence.

*event-flux* use the event-emitter style to notify other stores and components that the store state has changed.

### Install the package

```bash
npm install event-flux --save
```

require the package by

```js
const { StoreBase, Provider, AppStoreBase } = require('event-flux');
```

### How to use

#### define Stores

First, define some stores that your app need. Store object is the class extends `StoreBase` and contains the state.

The `Store` class contains `constructor` function that set the initialization state and some action methods that change the store's state by `setState`.

```js
import { StoreBase } from 'event-flux';

export default class TodoStore extends StoreBase {
  constructor(key) {
    super();
  	this.state = { key, todos: store(key) };
  }

  addTodo(title) {
  	let todos = this.state.todos.concat({
      title: title,
      completed: false
  	});
    this.setState({ todos });
  }
}
```

### define React Component

Then, create some React component just like before.

```js
class TodoItem extends PureComponent {
  constructor(props) {
    super(props);
    this.state = { editText: props.todo.title };
  }
}
```

### define some container Components

Then, create some `PureComponent` that observe the store's state change and `connect` the root store to the container component.

```js
const { withState } = require('event-flux');
class TodoApp extends PureComponent {
  constructor(props, context) {
    super(props);
    this.state = {
      nowShowing: ALL_TODOS,
      editing: null,
      newTodo: ''
    };
    this.todoStore = this.props.todoStore;
  }

  componentWillMount() {
    this.observeStore(this.todoStore);
  }
}

const mapStateToProps = (state) => state;
const mapStoreToProps = (appStore) => ({ todoStore: appStore.todoStore });
export default withState(mapStoreToProps, mapStateToProps)(TodoApp);
```

The `TodoApp` will observe the `todoStore` state. When the `todoStore` state changes, the TodoApp's props will be changed and the `TodoApp` component's state will be changed.

### Render the DOM

```js
import { Provider } from 'event-flux';
import TodoApp from './TodoApp';
import TodoStore from './TodoStore';

ReactDOM.render(
  <Provider stores={[TodoStore]}>
    <TodoApp />
  </appStore>,
  document.getElementsByClassName('todoapp')[0]
);
```

More info can refer to `example/todoMVC/`
