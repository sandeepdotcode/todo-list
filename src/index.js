import {
  addNewProject, addNewTask, changeView, deleteTask, displayTasks, getDaysTasks,
  getWeeksTasks,
} from './modules/app-controller';

function todoListDisplay() {
  console.log('Inbox:');
  changeView('inbox');
  console.log('Today\'s Tasks:');
  changeView('today');
  console.log('This Week:');
  changeView('week');
  addNewProject('Shopping List');
  addNewTask('Buy Fish', 'Buy some fish', 1, '2023-04-17', [], 'Shopping List');
  changeView('project', 'Shopping List');
}

todoListDisplay();
