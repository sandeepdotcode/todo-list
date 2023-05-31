import { getViewTaskList, toggleShowDueOnly } from './app-controller';
import pubSub from './pubsub';
import { loadProjHeader, loadProject, loadView } from './ui-components';
import {
  checkCurrentViewStrict, getCurrentView, getTaskFromTaskNode, getViewDisplayName,
  hideNode,
  makeViewSelectorActive, removeFlatpickr, removeTextStrike,
  resetDisplay,
  setFocusToTextBox, setupDateCtrl, strikeInnerText, unHideNode,
} from './ui-helpers';
import { getShowDueOnlyStatus, setShowDueOnly, unsetShowDueOnly } from './settings';

let headerBackup = null;
let taskNodeBackup = null;
let currentTask = null;

function showSettings() {
  const settingsContainer = document.querySelector('.settings-container');
  const dueOnlySwitch = document.getElementById('due-only-switch');
  dueOnlySwitch.checked = !getShowDueOnlyStatus();
  settingsContainer.classList.remove('hidden');
  document.querySelector('header').innerHTML = '<h1 class="title">Settings</h1>';
}

function closeSettings() {
  const settingsContainer = document.querySelector('.settings-container');
  settingsContainer.classList.add('hidden');
  const [viewOrProj, viewOrProjName] = getCurrentView();
  if (viewOrProj === 'view') {
    loadProjHeader(getViewDisplayName(viewOrProjName));
  } else {
    loadProjHeader(viewOrProjName);
  }
}

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
  const titleNode = document.querySelector('.title');

  if (titleNode && titleNode.textContent === 'Settings') closeSettings();
  makeViewSelectorActive(viewSelector);
  if (view === 'project') {
    renderViewOrProject(view, viewSelector.innerText);
  } else {
    renderViewOrProject('view', view);
  }
}

function syncActiveNodeAndBackup() {
  const activeNode = document.querySelector('.task-div.selected');
  taskNodeBackup = activeNode.cloneNode(true);
  const taskRight = taskNodeBackup.querySelector('.task-right');
  const taskControls = taskNodeBackup.querySelector('.task-control');
  const dateDiv = taskControls.querySelector('.date-div');
  taskRight.appendChild(dateDiv);
  unHideNode(taskRight);

  taskNodeBackup.removeChild(taskControls);
  taskNodeBackup.classList.remove('selected');
}

function closeTask() {
  const taskNode = document.querySelector('.task-div.selected');
  if (!taskNode.classList.contains('.editing')) syncActiveNodeAndBackup();
  taskNode.replaceWith(taskNodeBackup);
  removeFlatpickr();
  taskNodeBackup = null;
  currentTask = null;
}

function closeTaskFromEvents(event) {
  if (event.type === 'click' && !document.querySelector('.task-div.selected')) {
    taskNodeBackup = null;
    return;
  }
  if (event.type === 'keyup' && event.code !== 'Escape') return;
  if (event.type === 'click' && event.target.closest('.flatpickr-calendar')) return;
  if (event.type === 'click' && event.target.closest('.selected')) return;
  const taskCheck = document.querySelector('.selected .task-check');
  if (getShowDueOnlyStatus() && taskCheck && event.type === 'click' && taskCheck.checked) return; // Prevent .selected task persisting after completion
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
  if (event.target.closest('.checklist-div')) return;
  if (taskNodeBackup !== null) closeTask();
  const taskNode = event.target.closest('.task-div');
  if (!taskNode) return;

  taskNodeBackup = taskNode.cloneNode(true);
  const projectName = checkCurrentViewStrict() ? taskNode.getAttribute('data-project') : document.querySelector('.title').innerText;
  currentTask = getTaskFromTaskNode(taskNode);

  taskNode.classList.add('selected');
  const bottomCtrls = document.createElement('div');
  bottomCtrls.className = 'task-control';
  const priorityDiv = taskNode.querySelector('.priority-div');
  const priority = priorityDiv ? priorityDiv.getAttribute('data-priority') : '';
  const checkListDiv = taskNode.querySelector('.checklist-div');
  hideNode(taskNode.querySelector('.task-right'));
  bottomCtrls.innerHTML = `<div class="task-control-left"></div>
  <div class="task-control-right">
  ${checkListDiv ? '' : '<button class="checklist-btn"><ion-icon name="list-outline" class="list-control"></ion-icon></button>'}
  <div class="dropdown-div"><button class="priority-btn" data-priority=${priority}>
    <ion-icon name="flag-outline" class="priority-control"></ion-icon><span>${priority}
  </button></div>
  <div class="proj-dropdown dropdown-div"><button type="button" class="dropdown-btn">${projectName}
  <ion-icon name="chevron-down-outline" class="dropdown-icon"></ion-icon></button></div>
  <div class="control-button-div"><button type="button" class="cancel-btn">Cancel</button>
  <button type="submit" class="save-btn">Save</button></div>
  </div>`;
  taskNode.appendChild(bottomCtrls);
  setupDateCtrl(bottomCtrls, currentTask);
  const leftControls = taskNode.querySelector('.task-control-left');
  leftControls.appendChild(taskNode.querySelector('.date-div'));

  addTaskListeners(taskNode);
}

function handleTickedTaskDiv(taskNode) {
  strikeInnerText(taskNode.querySelector('h4.task-title'));
  strikeInnerText(taskNode.querySelector('.task-note'));
  const taskRight = taskNode.querySelector('.task-right');
  taskRight.classList.add('hidden');

  if (getShowDueOnlyStatus()) {
    currentTask = null;
    taskNodeBackup = null;
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

function clickSubTaskCheck(event) {
  const subTaskDiv = event.target.closest('.checklist-item-div');
  if (!subTaskDiv) return;
  const taskDiv = event.target.closest('.task-div');
  if (taskDiv.classList.contains('selected') && event.target.nodeName !== 'INPUT') return;
  const input = subTaskDiv.querySelector('input');
  if (event.target.nodeName !== 'INPUT') {
    input.checked = !input.checked;
  }
  const subTaskText = subTaskDiv.querySelector('.checklist-item-text');
  if (input.checked) { strikeInnerText(subTaskText); } else { removeTextStrike(subTaskText); }
  currentTask = getTaskFromTaskNode(taskDiv);
  currentTask.toggleCheckCompletion(subTaskText.innerText);
  if (currentTask.isCompleted) {
    taskDiv.querySelector('.task-check').checked = true;
    handleTickedTaskDiv(taskDiv);
  }
  currentTask = null;
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

function dueOnlyClicked() {
  const dueOnlySwitch = document.getElementById('due-only-switch');
  const status = document.querySelector('.due-only-status');

  // checked represents - Show finished - dueOnly = false
  if (dueOnlySwitch.checked) {
    unsetShowDueOnly();
    status.textContent = 'yes';
    status.classList.add('due-yes');
  } else {
    setShowDueOnly();
    status.textContent = 'no';
    status.classList.remove('due-yes');
  }
  toggleShowDueOnly();
  reRenderView();
  document.querySelector('header').innerHTML = '<h1 class="title">Settings</h1>';
}

function activateSettingsHandlers() {
  const closeBtn = document.querySelector('.settings-close-btn');
  const dueOnlySwitch = document.getElementById('due-only-switch');

  dueOnlySwitch.addEventListener('click', dueOnlyClicked);
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
  taskContainer.addEventListener('click', clickSubTaskCheck);
}

export {
  applyInitialHandlers, renderViewOrProject,
};
