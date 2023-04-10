class Task {
  #creationTimeStamp;

  constructor(name, description, priority, dateString, checkList) {
    this.name = name;
    this.description = description;
    this.priority = priority;
    this.dueDate = new Date(dateString);
    this.checkList = checkList;
    this.isCompleted = false;

    this.#creationTimeStamp = Date.now();
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

  getCreationTime() {
    return this.#creationTimeStamp;
  }
}

function createTask(name, description, priority, dueDate, checkList) {
  return new Task(name, description, priority, dueDate, checkList);
}

export default createTask;
