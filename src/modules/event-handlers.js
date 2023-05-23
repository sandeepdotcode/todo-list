import { getTaskFromProject, getViewTaskList } from './app-controller';
import pubSub from './pubsub';
import { loadProjHeader, loadProject, loadView } from './ui-components';
import {
  checkCurrentViewStrict, getCurrentView, getViewDisplayName,
  makeViewSelectorActive, removeFlatpickr, removeTextStrike,
  resetDisplay,
  setFocusToTextBox, setupDateCtrl, strikeInnerText,
} from './ui-helpers';
import { getShowDueOnlyStatus } from './settings';

let headerBackup = null;
let taskNodeBackup = null;
let currentTask = null;

function renderViewOrProject(viewType, viewOrProjName = null) {
  if (viewType === 'view') {
    const taskList = getViewTaskList(viewOrProjName);
    loadView(getViewDisplayName(viewOrProjName), taskList);
  } else if (viewType === 'project') {
    const taskList = getViewTaskList('project', viewOrProjName);
    loadProject(viewOrProjName, taskList);
  }
}

function reRenderView() {
  const [viewType, viewOrProjName] = getCurrentView();
  renderViewOrProject(viewType, viewOrProjName);
}

function changeView(event) {
  const viewSelector = event.target.closest('.project-select, .today, .this-week, .inbox');
  if (!viewSelector) return;
  const view = viewSelector.getAttribute('data-view');

  makeViewSelectorActive(viewSelector);
  if (view === 'project') {
    renderViewOrProject(view, viewSelector.innerText);
  } else {
    renderViewOrProject('view', view);
  }
}

function closeTask() {
  const taskNode = document.querySelector('.task-div.selected');
  taskNode.replaceWith(taskNodeBackup);
  removeFlatpickr();
  taskNodeBackup = null;
}

function closeTaskFromEvents(event) {
  if (event.type === 'click' && !document.querySelector('.task-div.selected')) {
    taskNodeBackup = null;
    return;
  }
  if (event.type === 'keyup' && event.code !== 'Escape') return;
  if (event.type === 'click' && event.target.closest('.selected')) return;
  closeTask();
  window.removeEventListener('keyup', closeTaskFromEvents);
  window.removeEventListener('click', closeTaskFromEvents);
}

function addTaskListeners(taskNode) {
  window.addEventListener('keyup', closeTaskFromEvents);
  window.addEventListener('click', closeTaskFromEvents);
}

function viewTask(event) {
  if (event.target.nodeName === 'INPUT') return;
  if (event.target.closest('.selected')) return;
  if (taskNodeBackup !== null) closeTask();
  const taskNode = event.target.closest('.task-div');
  if (!taskNode) return;

  taskNodeBackup = taskNode.cloneNode(true);
  const taskName = taskNode.querySelector('.task-title').innerText;
  const taskTime = Number(taskNode.getAttribute('data-time'));
  const projectName = checkCurrentViewStrict() ? taskNode.getAttribute('data-project') : document.querySelector('.title').innerText;
  currentTask = getTaskFromProject(taskName, taskTime, projectName);

  taskNode.classList.add('selected');
  const bottomCtrls = document.createElement('div');
  bottomCtrls.className = 'task-control';
  bottomCtrls.innerHTML = `<div class="task-control-left"></div>
  <div class="task-control-right">
  <button class="checklist-btn"><ion-icon name="list-outline" class="list-control"></ion-icon></button>
  <div class="dropdown-div"><button class="priority-btn">
    <ion-icon name="flag-outline" class="priority-control"></ion-icon>
  </button></div>
  <div class="proj-dropdown dropdown-div"><button type="button" class="dropdown-btn">${projectName}
  <ion-icon name="chevron-down-outline" class="dropdown-icon"></ion-icon></button></div>
  <div class="control-button-div hidden"><button type="button" class="cancel-btn">Cancel</button>
  <button type="submit" class="save-btn">Save</button></div>
  </div>`;
  taskNode.appendChild(bottomCtrls);
  setupDateCtrl(bottomCtrls, currentTask);

  addTaskListeners(taskNode);
}

function handleTickedTaskDiv(taskNode) {
  strikeInnerText(taskNode.querySelector('h4.task-title'));
  strikeInnerText(taskNode.querySelector('.task-note'));
  const taskRight = taskNode.querySelector('.task-right');
  taskRight.classList.add('hidden');

  if (getShowDueOnlyStatus()) {
    setTimeout(() => { taskNode.remove(); }, 800);
  }
}

function handleUntickedTask(taskNode) {
  if (getShowDueOnlyStatus()) {
    reRenderView();
  } else {
    removeTextStrike(taskNode.querySelector('h4.task-title'));
    removeTextStrike(taskNode.querySelector('.task-note'));
    const taskRight = taskNode.querySelector('.task-right');
    taskRight.classList.remove('hidden');
  }
}

function clickTaskCheck(event) {
  if (!event.target.classList.contains('task-check') && !event.target.classList.contains('task-check')) return;
  const taskNode = event.target.closest('.task-div');
  const name = taskNode.querySelector('h4.task-title').innerText;
  const creationTime = Number(taskNode.getAttribute('data-time'));
  let project = null;
  if (checkCurrentViewStrict()) {
    project = taskNode.getAttribute('data-project');
  } else {
    project = document.querySelector('h1.title').innerText;
  }
  pubSub.publish('taskCheckClicked', [name, creationTime, project]);

  if (event.target.checked) {
    handleTickedTaskDiv(taskNode);
    if (taskNodeBackup) {
      taskNodeBackup.querySelector('.task-check').checked = true;
      handleTickedTaskDiv(taskNodeBackup);
    }
  } else {
    handleUntickedTask(taskNode);
    if (taskNodeBackup) {
      taskNodeBackup.querySelector('.task-check').checked = false;
      handleUntickedTask(taskNodeBackup);
    }
  }
}

function createNewProject() {
  const header = document.querySelector('header');
  if (header.firstElementChild.className === 'title') { headerBackup = header.cloneNode(true); }
  header.innerHTML = '<input type="text" name="title" placeholder="New Project" autocomplete="off">';
  const input = document.querySelector('input[name="title"]');
  setFocusToTextBox(input);

  input.addEventListener('keydown', (event) => {
    if (event.code === 'Escape') {
      header.replaceWith(headerBackup);
    } else if (event.code === 'Enter') {
      const title = input.value;
      pubSub.publish('projectAdded', title);
      resetDisplay();
      loadProjHeader(title);
    }
  });
}

function showSettings() {
  const settingsContainer = document.querySelector('.settings-container');
  settingsContainer.classList.remove('hidden');
}

function closeSettings() {
  const settingsContainer = document.querySelector('.settings-container');
  settingsContainer.classList.add('hidden');
}

function activateSettingsHandlers() {
  const closeBtn = document.querySelector('.settings-close-btn');

  closeBtn.addEventListener('click', closeSettings);
}

function applyInitialHandlers() {
  const newProjBtn = document.querySelector('.new-proj-btn');
  const sideBar = document.querySelector('.side-display');
  const taskContainer = document.querySelector('.task-container');
  const settingsBtn = document.querySelector('.settings-btn');

  sideBar.addEventListener('click', changeView);
  settingsBtn.addEventListener('click', showSettings);
  activateSettingsHandlers();
  newProjBtn.addEventListener('click', createNewProject);

  taskContainer.addEventListener('click', viewTask);
  taskContainer.addEventListener('click', clickTaskCheck);
}

export {
  applyInitialHandlers, renderViewOrProject,
};
