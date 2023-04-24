import '../styles/display-components.css';
import { getProjectNames } from './app-controller';
import pubSub from './pubsub';

function addProjToSidebar(name) {
  const projContainer = document.querySelector('.project-container');
  const projDiv = document.createElement('div');
  projDiv.classList.add('project-select');
  projDiv.innerHTML = '<ion-icon class="proj-icon" name="bookmark"></ion-icon>';
  const nameText = document.createTextNode(name);
  projDiv.appendChild(nameText);
  projContainer.appendChild(projDiv);
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

export { loadMainDisplay };
