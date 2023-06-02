import './styles/sliders-dropdowns.css';
import {
  addNewProject, addNewTask, addSubTask, changeDueDate, changeTaskPriority,
  deleteSubTask, deleteTask, displayTasksToConsole, editTask, getViewTaskList,
  toggleShowDueOnly, toggleSubTask, toggleTaskCompletion,
} from './modules/app-controller';
import initialLoad from './modules/dom-controller';
import './styles/reset.css';
import './styles/style.css';

function todoListDisplay() {
  console.log('Inbox:');

  displayTasksToConsole(getViewTaskList('inbox'));
  console.log('Today\'s Tasks:');
  displayTasksToConsole(getViewTaskList('today'));
  console.log('This Week:');
  displayTasksToConsole(getViewTaskList('week'));
  addNewProject('Shopping List');
  addNewProject('Fitness');
  window.addNewTask = addNewTask;
  // addNewTask('Buy Fish', 'Buy some fish', 1, '2023-04-17', null, 'Shopping List');
  // getViewTaskList('project', 'Shopping List');
  window.displayView = (name) => {
    displayTasksToConsole(getViewTaskList(name));
  };
  window.deleteTask = deleteTask;
  window.toggleTask = toggleTaskCompletion;
  window.toggleDue = toggleShowDueOnly;
  window.addCheck = addSubTask;
  window.togglCheck = toggleSubTask;
  window.deleteCheck = deleteSubTask;
  addNewTask('Buy Groceries', 'Purchase Groceries for the week', 1, '2023-04-17', ['Go to Shop', 'Buy Vegetables', 'Buy Fruits', 'Buy '], 'Shopping List');
  window.changePrio = changeTaskPriority;
  window.changeDue = changeDueDate;
  window.editTask = editTask;
}

todoListDisplay();

initialLoad();
