import createTask from './todos';

function getSampleTasks() {
  const sampleProjects = [];
  sampleProjects.push(createTask('Meditate', 'Meditate for 10 mins', '', '2023-04-20'));
  sampleProjects.push(createTask('Make Bed', 'Make bed after waking up', '', '2023-04-18'));
  sampleProjects.push(createTask('The Odin Project', 'Learn WebDev', '', '2023-05-24'));
  sampleProjects.push(createTask('Walk', 'Go for a walk', '', '2023-04-18'));
  sampleProjects.push(createTask('AppController', 'Complete app control module', '', '2023-04-14'));

  return sampleProjects;
}

export default getSampleTasks;
