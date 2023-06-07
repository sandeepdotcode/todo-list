import flatpickr from 'flatpickr';
import { getProjectNames, getTaskFromProject } from './app-controller';

function setFocusToTextBox(node) {
  node.focus();
}

function resetDisplay() {
  const header = document.querySelector('.header');
  const taskContainer = document.querySelector('.task-container');

  header.innerHTML = '';
  if (taskContainer.previousElementSibling) {
    taskContainer.previousElementSibling.remove();
  }
  taskContainer.innerHTML = '';
}

function checkCurrentViewStrict() {
  const title = document.querySelector('.title').innerHTML;
  if (title === 'Today' || title === 'This Week') return true;
  return false;
}

function makeViewSelectorActive(selectorNode) {
  const sideBar = document.querySelector('.side-display');
  const currentlyActive = sideBar.querySelector('.active');
  if (currentlyActive) {
    currentlyActive.classList.remove('active');
  }
  selectorNode.classList.add('active');
}

function markViewActive(name) {
  const sideDisplay = document.querySelector('.side-display');
  const selectorArray = sideDisplay.querySelectorAll('div[data-view]');

  selectorArray.forEach((selector) => {
    if (selector.innerText === name || selector.getAttribute('data-view') === name) {
      makeViewSelectorActive(selector);
    }
  });
}

function getCurrentView() {
  const viewSelector = document.querySelector('.active[data-view]');
  if (!viewSelector) return null;
  const view = viewSelector.getAttribute('data-view');
  if (view === 'project') return ['project', viewSelector.innerText];
  return ['view', view];
}

function getViewDisplayName(view) {
  if (view === 'today') return 'Today';
  if (view === 'week') return 'This Week';
  if (view === 'inbox') return 'Inbox';
  return 'ERROR getting view name';
}

function strikeInnerText(node) {
  node.classList.add('striked');
}

function removeTextStrike(node) {
  node.classList.remove('striked');
}

function addFlatpickr(dateInputClass, defaultDueDate) {
  flatpickr(dateInputClass, {
    enableTime: false,
    altInput: true,
    dateFormat: 'Y-m-d',
    altFormat: 'F j, Y',
    // dateFormat: 'Y-m-d H-i',
    // altFormat: 'H:i F j, Y',
    defaultDate: defaultDueDate,
  });
}

function setupDateCtrl(ctrlNode, currentTask) {
  const ctrlLeft = ctrlNode.querySelector('.task-control-left');
  if (!currentTask.dueDate) {
    ctrlLeft.innerHTML = `<button type="button">
    <ion-icon name="calendar-number-outline" class="add-date-icon" aria-hidden="true"></ion-icon>Add Date</button>`;
  } else {
    ctrlLeft.innerHTML = '<input type="text" class="date-control"></input>';
    addFlatpickr('.date-control', currentTask.dueDate);
  }
}

function getTaskFromTaskNode(taskNode) {
  const taskName = taskNode.querySelector('.task-title').innerText;
  const taskTime = Number(taskNode.getAttribute('data-time'));
  const projectName = checkCurrentViewStrict() ? taskNode.getAttribute('data-project') : document.querySelector('.title').innerText;
  return getTaskFromProject(taskName, taskTime, projectName);
}

function hideNode(node) {
  node.classList.add('hidden');
}

function unHideNode(node) {
  node.classList.remove('hidden');
}

function createTaskDropdowns(taskNode) {
  const priorityDropDiv = taskNode.querySelector('.priority-dropdown');
  const projDropDiv = taskNode.querySelector('.proj-dropdown');

  priorityDropDiv.innerHTML += `<div class="dropdown-list priority-drop-list hidden">
  <a class="drop-link" data-priority="0"><ion-icon name="flag" class="priority-option"></ion-icon>0 - No Priority</a>
  <a class="drop-link" data-priority="1"><ion-icon name="flag" class="priority-option"></ion-icon>1 - High Priority</a>
  <a class="drop-link" data-priority="2"><ion-icon name="flag" class="priority-option"></ion-icon>2 - Med Priority</a>
  <a class="drop-link" data-priority="3"><ion-icon name="flag" class="priority-option"></ion-icon>3 - Low Priority</a></div>`;

  projDropDiv.innerHTML += `<div class="dropdown-list proj-drop-list hidden">
  <a class="drop-link">Inbox</a>
  </div>`;
  const projList = projDropDiv.querySelector('.dropdown-list');
  getProjectNames().forEach((projName) => {
    const link = document.createElement('a');
    link.textContent = projName;
    link.className = 'drop-link';
    projList.appendChild(link);
  });
}

function removeFlatpickr(taskNode) {
  const calendar = taskNode.querySelector('.date-control')._flatpickr;
  calendar.destroy();
}

function getEditableCheckItem() {
  const checkItemDiv = document.createElement('div');
  checkItemDiv.className = 'checklist-field-div';
  checkItemDiv.innerHTML = `<input type="checkbox" name="subcheck" class="subtask-check" disabled>
  <span class="add-checklist-field" contenteditable="true"></span>`;

  return checkItemDiv;
}

export {
  checkCurrentViewStrict, getCurrentView, strikeInnerText, removeTextStrike,
  setFocusToTextBox, resetDisplay, getViewDisplayName,
  makeViewSelectorActive, markViewActive, setupDateCtrl,
  removeFlatpickr, getTaskFromTaskNode, hideNode, unHideNode,
  createTaskDropdowns, getEditableCheckItem, addFlatpickr,
};
