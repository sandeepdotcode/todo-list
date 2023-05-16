import { applyInitialHandlers } from './event-handlers';
import { loadMainDisplay, loadView } from './ui-components';
import '../styles/dynamic-elements.css';
import { getViewTaskList } from './app-controller';

function initialLoad() {
  loadMainDisplay();
  loadView('Inbox', getViewTaskList('inbox'));
  applyInitialHandlers();
}

export { initialLoad };
