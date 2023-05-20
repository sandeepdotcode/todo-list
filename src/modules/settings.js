let showDueOnly = true;
// type - view or project, name - today, week, or projectName
const homeView = {
  type: 'view',
  name: 'today',
};

function setShowDueOnly() {
  showDueOnly = true;
}

function unsetShowDueOnly() {
  showDueOnly = false;
}

function getShowDueOnlyStatus() {
  return showDueOnly;
}

function setHomeView(type, name) {
  homeView.type = type;
  homeView.name = name;
}

function getHomeViewName() {
  return homeView.name;
}

function getHomeViewType() {
  return homeView.type;
}

export {
  getHomeViewName, getHomeViewType, setHomeView,
  getShowDueOnlyStatus, setShowDueOnly, unsetShowDueOnly,
};
