import { applyInitialHandlers, renderViewOrProject } from './event-handlers';
import { loadMainDisplay } from './ui-components';
import '../styles/dynamic-elements.css';
import { getHomeViewName, getHomeViewType } from './settings';
import { markViewActive } from './ui-helpers';

function initialLoad() {
  loadMainDisplay();
  applyInitialHandlers();
  renderViewOrProject(getHomeViewType(), getHomeViewName());
  markViewActive(getHomeViewName());
}

export default initialLoad;
