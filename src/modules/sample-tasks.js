import createTask from './todos';

function getSampleTasks() {
  const sampleProjects = [];
  sampleProjects.push(createTask('Meditate', 'Meditate for 10 mins', '', '2023-04-19'));
  sampleProjects.push(createTask('Make Bed', 'Make bed after waking up', '', '2023-04-17'));
  sampleProjects.push(createTask('The Odin Project', 'Learn WebDev', '', '2023-05-23'));
  sampleProjects.push(createTask('Walk', 'Go for a walk', '', '2023-04-17'));
  sampleProjects.push(createTask('AppController', 'Complete app control module', '', '2023-04-13'));

  return sampleProjects;
}

export default getSampleTasks;
