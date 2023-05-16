import flatpickr from 'flatpickr';
import { getTaskFromProject, getViewTaskList } from './app-controller';
import pubSub from './pubsub';
import { loadProjHeader, loadProject, loadView } from './ui-components';
import { checkCurrentViewStrict, setFocusToTexBox } from './ui-helpers';

let headerBackup = null;
let taskNodeBackup = null;
let currentTask = null;

function setupDateCtrl(ctrlNode) {
  const ctrlLeft = ctrlNode.querySelector('.task-control-left');
  if (!currentTask.dueDate) {
    ctrlLeft.innerHTML = `<button type="button">
    <ion-icon name="calendar-number-outline" class="add-date-icon" aria-hidden="true"></ion-icon>Add Date</button>`;
  } else {
    ctrlLeft.innerHTML = '<input type="text" class="date-control"></input>';
    flatpickr('.date-control', {
      enableTime: false,
      altInput: true,
      dateFormat: 'Y-m-d',
      altFormat: 'F j, Y',
      // dateFormat: 'Y-m-d H-i',
      // altFormat: 'H:i F j, Y',
      defaultDate: currentTask.dueDate,
    });
  }
}

function closeTask() {
  const taskNode = document.querySelector('.task-div.selected');
  taskNode.replaceWith(taskNodeBackup);
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
  if (event.target.nodeName === 'INPUT' || taskNodeBackup !== null) return;
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
  <ion-icon name="list-outline" class="list-control"></ion-icon><ion-icon name="flag-outline" class="priority-control"></ion-icon>
  <div class="proj-dropdown"><button type="button" class="dropdown-btn">${projectName}
  <ion-icon name="chevron-down-outline" class="dropdown-icon"></ion-icon></button></div>
  <div class="control-button-div"><button type="button" class="cancel-btn">Cancel</button>
  <button type="submit" class="save-btn">Save</button></div>
  </div>`;
  taskNode.appendChild(bottomCtrls);
  setupDateCtrl(bottomCtrls);

  addTaskListeners(taskNode);
}

function applyMainListeners() {
  const taskContainer = document.querySelector('.task-container');

  taskContainer.addEventListener('click', viewTask);
}

function changeView(event) {
  const viewSelector = event.target.closest('.project-select, .today, .this-week, .inbox');
  if (!viewSelector) return;
  const view = viewSelector.getAttribute('data-view');
  if (view === 'today' || view === 'week' || view === 'inbox') {
    const taskList = getViewTaskList(view);
    loadView(viewSelector.innerText, taskList);
    applyMainListeners();
  } else if (view === 'project') {
    const taskList = getViewTaskList('project', viewSelector.innerText);
    loadProject(viewSelector.innerText, taskList);
    applyMainListeners();
  }
}

function createNewProject() {
  const header = document.querySelector('header');
  if (header.firstElementChild.className === 'title') { headerBackup = header.cloneNode(true); }
  header.innerHTML = '<input type="text" name="title" placeholder="New Project" autocomplete="off">';
  const input = document.querySelector('input[name="title"]');
  setFocusToTexBox(input);

  input.addEventListener('keydown', (event) => {
    if (event.code === 'Escape') {
      header.replaceWith(headerBackup);
    } else if (event.code === 'Enter') {
      const title = input.value;
      pubSub.publish('projectAdded', title);
      loadProjHeader(title);
    }
  });
}

function applyInitialHandlers() {
  const newProjBtn = document.querySelector('.new-proj-btn');
  const sideBar = document.querySelector('.side-display');

  sideBar.addEventListener('click', changeView);
  newProjBtn.addEventListener('click', createNewProject);
}

export { applyInitialHandlers, applyMainListeners };
