import pubSub from './pubsub';
import { setFocusToTexBox } from './ui-helpers';

let headerBackup = null;

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
      header.innerHTML = `<h1 class="title">${title}</h1>
      <div class="title-option"><ion-icon name="ellipsis-horizontal-outline" class="option-icon"></ion-icon></div>`;
    }
  });
}

function applyInitialHandlers() {
  const newProjBtn = document.querySelector('.new-proj-btn');

  newProjBtn.addEventListener('click', createNewProject);
}

export { applyInitialHandlers };
