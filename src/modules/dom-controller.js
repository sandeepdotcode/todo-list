import { applyInitialHandlers, applyMainListeners } from './event-handlers';
import { loadMainDisplay, loadView } from './ui-components';
import '../styles/dynamic-elements.css';
import { getViewTaskList } from './app-controller';

function initialLoad() {
  loadMainDisplay();
  applyInitialHandlers();
  loadView('Inbox', getViewTaskList('inbox'));
  applyMainListeners();
}

export { initialLoad };
