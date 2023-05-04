function setFocusToTexBox(node) {
  node.focus();
}

function resetDisplay() {
  const header = document.querySelector('.header');
  const main = document.querySelector('main');

  header.innerHTML = '';
  main.innerHTML = '<div class="task-container"></div>';
}

function checkCurrentViewStrict() {
  const title = document.querySelector('.title').innerHTML;
  if (title === 'Today' || title === 'This Week') return true;
  return false;
}

export { checkCurrentViewStrict, setFocusToTexBox, resetDisplay };
