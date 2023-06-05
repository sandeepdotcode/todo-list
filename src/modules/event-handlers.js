import { endOfDay } from 'date-fns';
import { editTask, getViewTaskList, toggleShowDueOnly } from './app-controller';
import pubSub from './pubsub';
import {
  getDateDisplayNode, getPriorityNode, loadProjHeader,
  loadProject, loadView,
} from './ui-components';
import {
  checkCurrentViewStrict, createTaskDropdowns, getCurrentView,
  getTaskFromTaskNode, getViewDisplayName, hideNode,
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
  const activeNode = document.querySelector('.selected-task');
  taskNodeBackup = activeNode.cloneNode(true);
  const taskRight = taskNodeBackup.querySelector('.task-right');
  const taskControls = taskNodeBackup.querySelector('.task-control');
  const dateDiv = taskControls.querySelector('.date-div');
  taskRight.appendChild(dateDiv);
  unHideNode(taskRight);

  taskNodeBackup.removeChild(taskControls);
  taskNodeBackup.classList.remove('selected-task');
}

function closeTask() {
  const taskNode = document.querySelector('.selected-task');
  removeFlatpickr(taskNode);
  if (!taskNode.classList.contains('.editing')) syncActiveNodeAndBackup();
  taskNode.replaceWith(taskNodeBackup);
  taskNodeBackup = null;
  currentTask = null;
}

function closeTaskFromEvents(event) {
  if (event.type === 'click' && !document.querySelector('.selected-task')) {
    taskNodeBackup = null;
    return;
  }
  if (event.type === 'keyup' && event.code !== 'Escape') return;
  if (event.type === 'click' && event.target.closest('.flatpickr-calendar')) return;
  if (event.type === 'click' && event.target.closest('.selected-task')) return;
  const taskCheck = document.querySelector('.selected-task .task-check');
  if (getShowDueOnlyStatus() && taskCheck && event.type === 'click' && taskCheck.checked) return; // Prevent .selected-task persisting after completion
  if (document.querySelector('.active-drop')) return; // Prevent closing when dropdowns are active
  if (document.querySelector('.selected-task').classList.contains('editing')) return;
  closeTask();
  window.removeEventListener('keyup', closeTaskFromEvents);
  window.removeEventListener('click', closeTaskFromEvents);
}

function turnEditingModeOff(taskNode) {
  taskNode.classList.remove('editing');
  taskNode.querySelector('.task-check').setAttribute('disabled', true);

  const title = taskNode.querySelector('.task-title');
  const note = taskNode.querySelector('.task-note');
  const checkListItems = taskNode.querySelectorAll('.checklist-item-text');
  if (title.getAttribute('contenteditable')) { title.setAttribute('contenteditable', false); }
  if (note.getAttribute('contenteditable')) { note.setAttribute('contenteditable', false); }
  checkListItems.forEach((item) => {
    if (item.getAttribute('contenteditable')) { item.setAttribute('contenteditable', false); }
  });
}

function turnEditingModeOn(taskNode) {
  taskNode.classList.add('editing');
  taskNode.querySelector('.task-check').setAttribute('disabled', true);
  taskNode.querySelectorAll('.subtask-check').forEach((subtask) => {
    subtask.setAttribute('disabled', true);
  });
}

function cancelTaskChanges(event) {
  const taskNode = event.target.closest('.selected-task');
  const titleBkp = taskNodeBackup.querySelector('.task-title');
  const noteBkp = taskNodeBackup.querySelector('.task-note');
  const checkBkp = taskNodeBackup.querySelector('.checklist-div');

  taskNode.querySelector('.task-title').replaceWith(titleBkp.cloneNode(true));
  taskNode.querySelector('.task-note').replaceWith(noteBkp.cloneNode(true));
  const checkDiv = taskNode.querySelector('.checklist-div');
  if (checkDiv) {
    checkDiv.replaceWith(checkBkp.cloneNode(true));
  }

  const fp = taskNode.querySelector('.date-control')._flatpickr;
  const priorityBtn = taskNode.querySelector('.priority-btn');
  const priorityBtnSpan = priorityBtn.querySelector('span');
  const projBtn = taskNode.querySelector('.change-proj-btn');
  const projBtnSpan = projBtn.querySelector('span');
  const projectName = checkCurrentViewStrict() ? taskNode.getAttribute('data-project') : document.querySelector('.title').innerText;
  fp.setDate(currentTask.dueDate);
  priorityBtn.setAttribute('data-priority', currentTask.priority);
  priorityBtnSpan.textContent = (currentTask.priority === 0 ? '' : currentTask.priority);
  projBtnSpan.textContent = projectName;

  turnEditingModeOff(taskNode);
}

function saveTaskChanges(event) {
  const taskNode = event.target.closest('.selected-task');
  const taskRight = taskNode.querySelector('.task-right');
  const projectName = checkCurrentViewStrict() ? taskNode.getAttribute('data-project') : document.querySelector('.title').innerText;
  const taskDetails = [];
  taskDetails.push(taskNodeBackup.querySelector('.task-title').innerText);
  taskDetails.push(Number(taskNode.getAttribute('data-time')));
  taskDetails.push(projectName);

  const title = taskNode.querySelector('.task-title');
  title.innerText = title.innerText.trimEnd();
  const descDiv = taskNode.querySelector('.task-note');
  descDiv.innerText = descDiv.innerText.trimEnd();
  const checkDiv = taskNode.querySelector('.checklist-div');
  const checkList = [];
  const newName = title.getAttribute('contenteditable') ? title.innerText : null;
  const newDesc = descDiv.getAttribute('contenteditable') ? descDiv.innerText : null;
  if (checkDiv) {
    checkDiv.querySelectorAll('.checklist-item-text').forEach((text) => {
      text.innerText = text.innerText.trimEnd();
      checkList.push(text.innerText);
    });
  }

  const fp = taskNode.querySelector('.date-control')._flatpickr;
  const projBtnSpan = taskNode.querySelector('.change-proj-btn span');
  const newDate = fp.selectedDates[0]; // modify later
  const newPriority = taskNode.querySelector('.priority-btn').getAttribute('data-priority');
  if (Number(newPriority) !== currentTask.priority) {
    const priorityDiv = taskRight.querySelector('.priority-div');
    priorityDiv.replaceWith(getPriorityNode(newPriority));
  }
  const newProjectName = projBtnSpan.innerText === projectName ? null : projBtnSpan.innerText;

  editTask(taskDetails, newName, newDesc, checkList, newDate, newPriority, newProjectName);
  turnEditingModeOff(taskNode);
}

function editText(event) {
  const { target } = event;
  const taskNode = target.closest('.selected-task');
  if (!taskNode) return;
  const title = taskNode.querySelector('.task-title');
  const taskNote = taskNode.querySelector('.task-note');
  const taskCheckList = taskNode.querySelectorAll('.checklist-item-div');

  let targetInCheckList = false;
  const targetCheckDiv = target.closest('.checklist-item-div');
  taskCheckList.forEach((itemDiv) => {
    if (targetCheckDiv && itemDiv === targetCheckDiv) { targetInCheckList = true; }
  });
  if (target !== title && target !== taskNote && !targetInCheckList) return;

  turnEditingModeOn(taskNode);
  target.setAttribute('contenteditable', true);
}

function editDate(selectedDates, dateStr, instance) {
  const taskNode = document.querySelector('.selected-task');
  const date = endOfDay(selectedDates[0]);
  const dateDiv = taskNode.querySelector('.date-div');

  turnEditingModeOn(taskNode);
  dateDiv.replaceWith(getDateDisplayNode(date));
}

function selectPriority(event) {
  if (!event.target.closest('.drop-link')) return;
  const taskNode = document.querySelector('.selected-task');
  const priorityBtn = taskNode.querySelector('.priority-btn');

  turnEditingModeOn(taskNode);
  const selectedPriorityValue = event.target.getAttribute('data-priority');
  const priorityBtnSpan = priorityBtn.querySelector('span');

  priorityBtn.setAttribute('data-priority', selectedPriorityValue);
  priorityBtnSpan.textContent = selectedPriorityValue;
}

function selectNewProj(event) {
  if (!event.target.closest('.drop-link')) return;
  const taskNode = document.querySelector('.selected-task');
  const projBtn = taskNode.querySelector('.change-proj-btn');

  turnEditingModeOn(taskNode);
  const selectedProject = event.target.innerText;
  const projBtnSpan = projBtn.querySelector('span');
  projBtnSpan.textContent = selectedProject;
}

function closeDropdowns(event) {
  const closestBtn = event.target.closest('.drop-btn');
  if (closestBtn && closestBtn.matches('.active-drop')) return;

  const dropBtns = document.querySelectorAll('.active-drop');
  dropBtns.forEach((btn) => {
    const dropList = btn.nextElementSibling;
    hideNode(dropList);
    btn.classList.remove('active-drop');
  });
}

function toggleDropdown(event) {
  const dropBtn = event.target.closest('.drop-btn');
  if (!dropBtn) return;
  if (!dropBtn.matches('.active-drop')) closeDropdowns(event);
  const dropList = dropBtn.nextElementSibling;
  dropList.classList.toggle('hidden');
  dropBtn.classList.toggle('active-drop');
}

function addTaskListeners(taskNode) {
  const rightControls = taskNode.querySelector('.task-control-right');
  const cancelBtn = taskNode.querySelector('.cancel-btn');
  const saveBtn = taskNode.querySelector('.save-btn');

  window.addEventListener('keyup', closeTaskFromEvents);
  window.addEventListener('click', closeTaskFromEvents);
  taskNode.addEventListener('click', editText);
  rightControls.addEventListener('click', toggleDropdown);
  rightControls.querySelector('.priority-drop-list').addEventListener('click', selectPriority);
  rightControls.querySelector('.proj-drop-list').addEventListener('click', selectNewProj);
  cancelBtn.addEventListener('click', cancelTaskChanges);
  saveBtn.addEventListener('click', saveTaskChanges);
}

function viewTask(taskNode) {
  taskNodeBackup = taskNode.cloneNode(true);
  const projectName = checkCurrentViewStrict() ? taskNode.getAttribute('data-project') : document.querySelector('.title').innerText;
  currentTask = getTaskFromTaskNode(taskNode);

  taskNode.classList.add('selected-task');
  const bottomCtrls = document.createElement('div');
  bottomCtrls.className = 'task-control';
  const { priority } = currentTask;
  const checkListDiv = taskNode.querySelector('.checklist-div');
  hideNode(taskNode.querySelector('.task-right'));
  bottomCtrls.innerHTML = `<div class="task-control-left"></div>
  <div class="task-control-right">
  ${checkListDiv ? '' : '<button class="checklist-btn"><ion-icon name="list-outline" class="list-control"></ion-icon></button>'}
  <div class="dropdown-div priority-dropdown"><button class="priority-btn drop-btn" data-priority=${priority}>
    <ion-icon name="flag-outline" class="priority-control"></ion-icon><span>${priority}
  </button></div>
  <div class="proj-dropdown dropdown-div"><button type="button" class="change-proj-btn drop-btn"><span>${projectName}</span>
  <ion-icon name="chevron-down-outline" class="change-proj-icon"></ion-icon></button></div>
  <div class="control-button-div"><button type="button" class="cancel-btn">Cancel</button>
  <button type="submit" class="save-btn">Save</button></div>
  </div>`;
  taskNode.appendChild(bottomCtrls);
  createTaskDropdowns();
  setupDateCtrl(bottomCtrls, currentTask);
  const leftControls = taskNode.querySelector('.task-control-left');
  leftControls.appendChild(taskNode.querySelector('.date-div'));

  addTaskListeners(taskNode);
}

function viewTaskFromEvents(event) {
  if (event.target.nodeName === 'INPUT') return;
  if (event.target.closest('.selected-task')) return;
  if (event.target.closest('.checklist-div')) return;
  if (document.querySelector('.editing')) return;
  if (taskNodeBackup !== null) closeTask();
  const taskNode = event.target.closest('.task-div');
  if (!taskNode) return;

  viewTask(taskNode);
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
  if (taskDiv.classList.contains('selected-task') && event.target.nodeName !== 'INPUT') return;
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

  taskContainer.addEventListener('click', viewTaskFromEvents);
  taskContainer.addEventListener('click', clickTaskCheck);
  taskContainer.addEventListener('click', clickSubTaskCheck);
  window.addEventListener('click', closeDropdowns);
}

export {
  applyInitialHandlers, renderViewOrProject, editDate,
};
