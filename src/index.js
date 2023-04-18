import {
  addNewProject, addNewTask, addSubTask, changeView,
  deleteSubTask, deleteTask, displayTasks, getDaysTasks,
  getWeeksTasks, toggleShowDueOnly, toggleSubTask,
  toggleTaskCompletion,
} from './modules/app-controller';

function todoListDisplay() {
  console.log('Inbox:');
  changeView('inbox');
  console.log('Today\'s Tasks:');
  changeView('today');
  console.log('This Week:');
  changeView('week');
  addNewProject('Shopping List');
  window.addNewTask = addNewTask;
  // addNewTask('Buy Fish', 'Buy some fish', 1, '2023-04-17', null, 'Shopping List');
  // changeView('project', 'Shopping List');
  window.changeView = changeView;
  window.deleteTask = deleteTask;
  window.toggleTask = toggleTaskCompletion;
  window.toggleDue = toggleShowDueOnly;
  window.addCheck = addSubTask;
  window.togglCheck = toggleSubTask;
  window.deleteCheck = deleteSubTask;
  addNewTask('Buy Fish', 'Buy some fish', 1, '2023-04-17', null, 'Shopping List');
}

todoListDisplay();
