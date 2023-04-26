function setFocusToTexBox(node) {
  node.focus();
}

function resetDisplay() {
  const header = document.querySelector('.header');
  const main = document.querySelector('main');

  header.innerHTML = '';
  main.innerHTML = '<div class="task-container"></div>';
}

export { setFocusToTexBox, resetDisplay };
