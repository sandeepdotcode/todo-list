import '../styles/display-components.css';
import { getProjectNames } from './app-controller';

function loadMainDisplay() {
  const body = document.querySelector('body');
  const projContainer = document.querySelector('.project-container');
  const projNames = getProjectNames();
  projNames.forEach((name) => {
    const projDiv = document.createElement('div');
    projDiv.classList.add('project-select');
    projDiv.innerHTML = '<ion-icon class="proj-icon" name="bookmark"></ion-icon>';
    const nameText = document.createTextNode(name);
    projDiv.appendChild(nameText);
    projContainer.appendChild(projDiv);
  });
}

export { loadMainDisplay };
