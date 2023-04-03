// import createTask from './todos';
import createProject from './projects';
import getSampleTasks from './sample-tasks';

const projects = [];
projects.push(createProject('default'));

getSampleTasks().forEach((task) => {
  projects[0].addTask(task);
});

export function displayProjects() {
  projects.forEach((project) => {
    console.table(project.getTasks());
  });
}
