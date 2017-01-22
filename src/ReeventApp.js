import TodoStore from './TodoStore';

module.exports = class ReeventApp {
  loadInClient() {
    this.todoStore = new TodoStore('reevent-todoMVC');
  }

  loadInServer() {
  }
}
