import { isSameMinute } from 'date-fns';

class Project {
  constructor(name) {
    this.name = name;
  }

  taskList = [];

  addTask(task) {
    this.taskList.push(task);
  }

  getTasks() {
    return this.taskList;
  }

  findTaskIndex(name, date) {
    return this.taskList.findIndex((task) => {
      const isSameTask = (task.name === name && isSameMinute(task.getCreationTime(), date));
      return isSameTask;
    });
  }

  removeTask(taskName, creationTime) {
    const index = this.findTaskIndex(taskName, creationTime);
    this.taskList.splice(index, 1);
  }
}

const createProject = (name) => new Project(name);

export default createProject;
