class Task {
  constructor(name, description, priority, dueDate, checkList) {
    this.name = name;
    this.description = description;
    this.priority = priority;
    this.dueDate = dueDate;
    this.checkList = checkList;
    this.isCompleted = false;
  }

  editTask(name, description, priority, dueDate) {
    this.name = name;
    this.description = description;
    this.priority = priority;
    this.dueDate = dueDate;
  }

  toggleCompletion() {
    this.isCompleted = !this.isCompleted;
  }
}

function createTask(name, description, priority, dueDate, checkList = []) {
  return new Task(name, description, priority, dueDate, checkList);
}

export default createTask;
