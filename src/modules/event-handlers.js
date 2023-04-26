import { getViewTaskList } from './app-controller';
import pubSub from './pubsub';
import { loadProjHeader, loadProject, loadView } from './ui-components';
import { setFocusToTexBox } from './ui-helpers';

let headerBackup = null;

function changeView(event) {
  const viewSelector = event.target.closest('.project-select, .today, .this-week, .inbox');
  if (!viewSelector) return;
  const view = viewSelector.getAttribute('data-view');
  if (view === 'today' || view === 'week' || view === 'inbox') {
    const taskList = getViewTaskList(view);
    loadView(viewSelector.innerText, taskList);
  } else if (view === 'project') {
    const taskList = getViewTaskList('project', viewSelector.innerText);
    loadProject(viewSelector.innerText, taskList);
  }
}

function createNewProject() {
  const header = document.querySelector('header');
  if (header.firstElementChild.className === 'title') { headerBackup = header.cloneNode(true); }
  header.innerHTML = '<input type="text" name="title" placeholder="New Project" autocomplete="off">';
  const input = document.querySelector('input[name="title"]');
  setFocusToTexBox(input);

  input.addEventListener('keydown', (event) => {
    if (event.code == 'Escape') {
      header.replaceWith(headerBackup);
    } else if (event.code == 'Enter') {
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

export { applyInitialHandlers };
