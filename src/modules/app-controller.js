import {
  addDays, isSameDay, isWithinInterval, startOfToday,
  formatDistanceToNowStrict,
} from 'date-fns';
import createTask from './todos';
import createProject from './projects';

const projects = [];
projects.push(createProject('default'));
const currentProject = projects[0];

function addNewProject(name = '') {
  if (name === '') {
    projects.push(createProject(`Project ${projects.length}`));
  } else {
    projects.push(createProject(name));
  }
}

function getProjectIndex(name) {
  projects.findIndex((project) => project.name === name);
}

function deleteProject(name) {
  const index = getProjectIndex(name);
  projects.splice(index, 1);
}

function addNewTask({
  name, description, priority, dueDate, checkList = [],
}) {
  const task = createTask(name, description, priority, dueDate, checkList);
  currentProject.addTask(task);
}

function deleteTask(name, creationTimeStamp) {
  currentProject.removeTask(name, creationTimeStamp);
}

function getDaysTasks(date) {
  const tasks = [];
  projects.forEach((project) => {
    const tasksToday = project.getTasks().filter((task) => isSameDay(task.dueDate, date));
    tasks.push(...tasksToday); // a.push(...b) stack overflows if b > 100000
  });
  return tasks;
}

function getWeeksTasks() {
  const tasks = [];
  const startDate = startOfToday();
  const endDate = addDays(startDate, 7);
  projects.forEach((project) => {
    const projTasks = project.getTasks().filter((task) => isWithinInterval(task.dueDate, {
      start: startDate,
      end: endDate,
    }));
    tasks.push(...projTasks);
  });
  return tasks;
}

function displayTasks(tasks) {
  console.table(tasks.map((task) => ({
    name: task.name,
    description: task.description,
    checkList: task.checkList,
    priority: task.priority,
    dueDate: formatDistanceToNowStrict(task.dueDate),
    timestamp: task.getCreationTime(),
    status: task.isCompleted,
  })));
}

export {
  addNewProject, deleteProject, addNewTask,
  deleteTask, getDaysTasks, getWeeksTasks, displayTasks,
};
