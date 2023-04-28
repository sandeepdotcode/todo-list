import { formatDistanceToNowStrict, isPast } from 'date-fns';
import '../styles/display-components.css';
import { getProjectNames } from './app-controller';
import pubSub from './pubsub';
import { resetDisplay } from './ui-helpers';

function addProjToSidebar(name) {
  const projContainer = document.querySelector('.project-container');
  const projDiv = document.createElement('div');
  projDiv.classList.add('project-select');
  projDiv.setAttribute('data-view', 'project');
  projDiv.innerHTML = '<ion-icon class="proj-icon" name="bookmark"></ion-icon>';
  const nameText = document.createTextNode(name);
  projDiv.appendChild(nameText);
  projContainer.appendChild(projDiv);
}

function loadProjHeader(projName) {
  const header = document.querySelector('header');
  header.innerHTML = `<h1 class="title">${projName}</h1>
      <div class="title-option"><ion-icon name="ellipsis-horizontal-outline" class="option-icon"></ion-icon></div>`;
}

function getPriorityNode(priority) {
  const priorityDiv = document.createElement('div');
  priorityDiv.className = 'priority-div';
  priorityDiv.setAttribute('data-priority', priority.toString());
  priorityDiv.innerHTML = '<ion-icon name="flag"></ion-icon>';
  return priorityDiv;
}

function getDateDisplayNode(dueDate) {
  const dateDiv = document.createElement('div');
  dateDiv.className = 'date-div';
  if (isPast(dueDate)) {
    dateDiv.innerHTML = `<ion-icon name="alert-outline"></ion-icon>overdue: ${formatDistanceToNowStrict(dueDate)}`;
    dateDiv.classList.add('overdue');
  } else {
    dateDiv.textContent = formatDistanceToNowStrict(dueDate);
  }
  return dateDiv;
}

function getTaskNode(task) {
  const taskNode = document.createElement('div');
  taskNode.innerHTML = `<div class="task-main">
  <div class="task-left">
  <input type="checkbox" name="isCompleted" class="task-check" ${task.isCompleted ? 'checked' : ''}>
  <h4 class="task-title">${task.name}</h4>
  </div>
  <div class="task-right"></div></div>
  <div class="task-note">${task.description}</div>`;
  taskNode.className = 'task-div';
  taskNode.setAttribute('data-time', task.getCreationTime());
  const taskRightDiv = taskNode.querySelector('.task-right');
  if (task.priority !== 0) taskRightDiv.appendChild(getPriorityNode(task.priority));
  taskRightDiv.appendChild(getDateDisplayNode(task.dueDate));
  return taskNode;
}

function loadProject(name, taskList, description = '') {
  const descLorem = `Doggo ipsum many pats tungg maximum borkdrive lotsa pats, puggorino.
  Corgo adorable doggo the neighborhood pupper doge wrinkler, I am bekom fat many pats borking doggo.`;

  resetDisplay();
  loadProjHeader(name);
  const main = document.querySelector('main');
  const taskContainer = document.querySelector('.task-container');
  const descDiv = document.createElement('div');
  descDiv.className = ('proj-description');
  descDiv.innerText = description || descLorem;
  main.prepend(descDiv);

  taskList.forEach((task) => {
    taskContainer.prepend(getTaskNode(task));
  });
}

function loadView(name, taskList) {
  resetDisplay();
  const taskContainer = document.querySelector('.task-container');
  loadProjHeader(name);
  taskList.forEach((task) => {
    taskContainer.appendChild(getTaskNode(task));
  });
}

function loadMainDisplay() {
  const projNames = getProjectNames();
  projNames.forEach((name) => {
    addProjToSidebar(name);
  });
}

(function subsribeToPubSub() {
  pubSub.subscribe('projectAdded', addProjToSidebar);
}());

export {
  loadMainDisplay, loadView, loadProject, loadProjHeader,
};
