import createTask from './todos';

function getSampleTasks() {
  const sampleProjects = [];
  sampleProjects.push(createTask('Meditate', 'Meditate for 10 mins', '', ''));
  sampleProjects.push(createTask('Make Bed', 'Make bed after waking up', '', ''));
  sampleProjects.push(createTask('The Odin Project', 'Learn WebDev', '', ''));
  sampleProjects.push(createTask('Walk', 'Go for a walk', '', ''));

  return sampleProjects;
}

export default getSampleTasks;
