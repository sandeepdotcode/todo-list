import {
  addNewProject, addNewTask, deleteTask, displayTasks, getDaysTasks,
  getWeeksTasks,
} from './modules/app-controller';
import getSampleTasks from './modules/sample-tasks';

getSampleTasks().forEach((task) => {
  addNewTask(task);
});

function todoListDisplay() {
  console.log('Default List');
  console.log('Today\'s Tasks:');
  displayTasks(getDaysTasks(new Date()));
  console.log('This Week:');
  displayTasks(getWeeksTasks());
}

todoListDisplay();
