import createTask from './todos';

function getSampleTasks() {
  const sampleProjects = [];
  sampleProjects.push(createTask('Meditate', 'Meditate for 10 mins', 2, '2023-05-28'));
  sampleProjects.push(createTask('Make Bed', 'Make bed after waking up', 1, '2023-04-19'));
  sampleProjects.push(createTask('The Odin Project', 'Learn WebDev', 3, '2023-05-29', ['Complete Todo List', 'HTML Forms', 'Advanced CSS', 'React']));
  sampleProjects.push(createTask('Walk', 'Go for a walk', 0, '2023-04-19'));
  sampleProjects.push(createTask('AppController', 'Complete app control module', 0, '2023-04-15'));

  return sampleProjects;
}

export default getSampleTasks;
