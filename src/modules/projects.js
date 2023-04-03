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

  findTaskIndex(name, dueDate) {
    return this.taskList.findIndex((task) => {
      const isSameTask = (task.name === name && task.dueDate === dueDate);
      return isSameTask;
    });
  }

  removeTask(task) {
    const index = this.findTaskIndex(task.name, task.dueDate);
    this.taskList.splice(index, 1);
  }
}

const createProject = (name) => new Project(name);

export default createProject;
