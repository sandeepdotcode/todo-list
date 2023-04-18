class Project {
  constructor(name) {
    this.name = name;
  }

  taskList = [];

  addTask(task) {
    this.taskList.push(task);
  }

  getTask(name, creationTime) {
    const index = this.findTaskIndex(name, creationTime);
    return this.taskList[index];
  }

  getTasks() {
    return this.taskList;
  }

  findTaskIndex(name, creationTime) {
    return this.taskList.findIndex((task) => {
      const isSameTask = (task.name === name && task.getCreationTime() === creationTime);
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
