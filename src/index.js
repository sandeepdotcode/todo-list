import {
  addNewProject, addNewTask, changeView, deleteTask, displayTasks, getDaysTasks,
  getWeeksTasks,
} from './modules/app-controller';
import getSampleTasks from './modules/sample-tasks';

getSampleTasks().forEach((task) => {
  addNewTask(task);
});

function todoListDisplay() {
  console.log('Default List');
  changeView('default');
  console.log('Today\'s Tasks:');
  changeView('today');
  console.log('This Week:');
  changeView('week');
}

todoListDisplay();
