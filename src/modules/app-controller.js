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

export {
  addNewProject, deleteProject, addNewTask,
  deleteTask,
};
