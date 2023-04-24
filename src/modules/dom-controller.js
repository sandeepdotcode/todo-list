import { applyInitialHandlers } from './event-handlers';
import { loadMainDisplay } from './ui-components';
import '../styles/dynamic-elements.css';

function initialLoad() {
  loadMainDisplay();
  applyInitialHandlers();
}

export { initialLoad };
