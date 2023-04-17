import {
  addDays, isSameDay, isWithinInterval, startOfToday,
  formatDistanceToNowStrict,
} from 'date-fns';
import createTask from './todos';
import createProject from './projects';

const projects = [];
projects.push(createProject('inbox'));
// currentView can be either of
// today, week or project
let currentView = 'today';
let currentProject = projects[0];
// Dictates whether completed tasks are returned or not
let dueOnly = true;

function addNewProject(name = '') {
  if (name === '') {
    projects.push(createProject(`Project ${projects.length}`));
  } else {
    projects.push(createProject(name));
  }
}

function getProjectIndex(name) {
  return projects.findIndex((project) => project.name === name);
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

function toggleShowDueOnly() {
  dueOnly = !(dueOnly);
}

function getCurrProjTasks() {
  if (dueOnly) { return currentProject.getTasks().filter((task) => task.isCompleted === false); }
  return currentProject.getTasks();
}

function getDaysTasks(date = new Date()) {
  const tasks = [];
  projects.forEach((project) => {
    const tasksToday = project.getTasks().filter((task) => {
      const isTaskCompleted = (task.isCompleted !== dueOnly);
      return isSameDay(task.dueDate, date) && isTaskCompleted;
    });
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
    }) && task.isCompleted !== dueOnly);
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

function changeView(view, projectName = 'inbox') {
  switch (view) {
    case 'today':
      currentView = 'today';
      displayTasks(getDaysTasks());
      break;
    case 'week':
      currentView = 'week';
      displayTasks(getWeeksTasks());
      break;
    case 'inbox':
    case 'project':
      currentView = 'project';
      currentProject = projects[getProjectIndex(projectName)];
      displayTasks(getCurrProjTasks());
      break;
    default:
      console.log('changeView() Error: Invalid Argument!');
  }
}

export {
  addNewProject, deleteProject, addNewTask,
  deleteTask, getDaysTasks, getWeeksTasks, displayTasks,
  changeView,
};
