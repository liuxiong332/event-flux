## Reevent

*Reevent* is the flux-like store management. It manage the complex links in those stores and make the view respond to the store change easy.

### How it run

*Reevent* contains the following objects:

* Store: the state container that like MVC's model.

* StoreApp: the store management container. It manage the life cycle of the stores and control the initialization sequence.

* VMComponent or PureVMComponent: just like `React` Component or PureComponent but add some methods that can obseve the store's state change.

*Reevent* use the event-emitter style to notify other stores and components that the store state has changed.

### Install the package

```bash
npm install reevent --save
```

require the package by

```js
const { StoreBase, VMComponent, PureVMComponent, ReeventProvider, ReeventApp } = require('reevent');
```

### How to use

#### define Stores

First, define some stores that your app need. Store object is the class extends `StoreBase` and contains the state.

The `Store` class contains `constructor` function that set the initialization state and some action methods that change the store's state by `setState`.

```js
import { StoreBase } from 'reevent';

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

#### define AppStore

Then, create class `AppStore` that init the stores.

```js
class AppStore extends ReeventApp {
  loadInClient() {
    this.todoStore = new TodoStore('reevent-todos');
    return this;
  }
  loadInServer() {}
}
```

`loadInClient` will run the initialization method in browser and `loadInServer` will run the initialization function in server.

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

### define some VM Components

Then, create some `VMComponent` that observe the store's state change.

```js
class TodoApp extends PureVMComponent {
  constructor(props, context) {
    super(props);
    this.state = {
      nowShowing: ALL_TODOS,
      editing: null,
      newTodo: ''
    };
    this.todoStore = context.reeventApp.todoStore;
  }

  componentWillMount() {
    this.observeStore(this.todoStore);
  }
}
```

The `TodoApp` will observe the `todoStore` state. When the `todoStore` state changes, the TodoApp's `onStateChange` method will be invoked and the `TodoApp` component's state will be changed.

### Render the DOM

```js
import AppStore from './AppStore';
import { ReeventProvider } from 'reevent';
import TodoApp from './TodoApp';

const reeventApp = new AppStore().loadInClient();

ReactDOM.render(
  <ReeventProvider reeventApp={reeventApp}>
    <TodoApp />
  </ReeventProvider>,
  document.getElementsByClassName('todoapp')[0]
);
```

More info can refer to `example/todoMVC/`
