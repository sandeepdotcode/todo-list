import { formatDistanceToNowStrict, isPast } from 'date-fns';
import '../styles/display-components.css';
import { getProjectNames } from './app-controller';
import pubSub from './pubsub';
import { markViewActive, resetDisplay, strikeInnerText } from './ui-helpers';
import { getShowDueOnlyStatus } from './settings';

function addProjToSidebar(name) {
  const projContainer = document.querySelector('.project-container');
  const projDiv = document.createElement('div');
  projDiv.classList.add('project-select');
  projDiv.setAttribute('data-view', 'project');
  projDiv.innerHTML = '<ion-icon class="proj-icon" name="bookmark"></ion-icon>';
  const nameText = document.createTextNode(name);
  projDiv.appendChild(nameText);
  projContainer.appendChild(projDiv);
  markViewActive(name);
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
  if (Number(priority) !== 0) { priorityDiv.innerHTML = '<ion-icon name="flag"></ion-icon>'; }
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

function getCheckItemDiv(item) {
  const checkItemDiv = document.createElement('div');
  checkItemDiv.className = 'checklist-item-div';
  checkItemDiv.innerHTML = `<input type="checkbox" name="subcheck" class="subtask-check"
  ${item.getCompletionStatus() ? 'checked' : ''}>
  <span class="checklist-item-text">${item.text}</span>`;

  if (item.getCompletionStatus()) {
    const textSpan = checkItemDiv.querySelector('.checklist-item-text');
    strikeInnerText(textSpan);
  }
  return checkItemDiv;
}

function getCheckListDiv(checkList) {
  const checkDiv = document.createElement('div');
  checkDiv.className = 'checklist-div';

  checkList.forEach((subTask) => {
    checkDiv.appendChild(getCheckItemDiv(subTask));
  });
  return checkDiv;
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
  if (task.checkList !== null) {
    taskNode.appendChild(getCheckListDiv(task.checkList));
  }
  taskNode.className = 'task-div';
  taskNode.setAttribute('data-time', task.getCreationTime());
  const taskRightDiv = taskNode.querySelector('.task-right');
  taskRightDiv.appendChild(getPriorityNode(task.priority));
  taskRightDiv.appendChild(getDateDisplayNode(task.dueDate));
  if (!getShowDueOnlyStatus() && task.isCompleted) {
    const taskName = taskNode.querySelector('.task-title');
    const taskDesc = taskNode.querySelector('.task-note');
    strikeInnerText(taskName);
    strikeInnerText(taskDesc);
    taskRightDiv.classList.add('hidden');
  }
  return taskNode;
}

function loadProject(name, taskList, description = '') {
  const descLorem = `Doggo ipsum many pats tungg maximum borkdrive lotsa pats, puggorino.
  Corgo adorable doggo the neighborhood pupper doge wrinkler, I am bekom fat many pats borking doggo.`;

  resetDisplay();
  loadProjHeader(name);
  const main = document.querySelector('main');
  const descDiv = document.createElement('div');
  const taskContainer = document.querySelector('.task-container');
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
    const taskNode = getTaskNode(task);
    taskNode.setAttribute('data-project', task.project);
    taskContainer.appendChild(taskNode);
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
  getDateDisplayNode, getPriorityNode, getCheckItemDiv,
};
