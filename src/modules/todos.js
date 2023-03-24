class Task {
  constructor(name, description, priority, dueDate) {
    this.name = name;
    this.description = description;
    this.priority = priority;
    this.dueDate = dueDate;
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

export default Task;
