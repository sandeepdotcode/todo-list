class Project {
  constructor(name, colour) {
    this.name = name;
    this.colour = colour;
  }

  taskList = [];

  addTask(task) {
    this.taskList.push(task);
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

export default Project;
