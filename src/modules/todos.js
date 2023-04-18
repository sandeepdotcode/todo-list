class Task {
  #creationTimeStamp;

  constructor(name, description, priority, dateString, checkList) {
    this.name = name;
    this.description = description;
    this.priority = priority;
    this.dueDate = new Date(dateString);
    this.checkList = checkList || null;
    this.isCompleted = false;

    this.#creationTimeStamp = Date.now();
  }

  addToCheckList(text) {
    if (!this.checkList) this.checkList = [];
    this.checkList.push({ text, isDone: false });
  }

  getCheckListIndex(text) {
    return this.checkList.findIndex((item) => item.text === text);
  }

  getAllCheckStatus() {
    return this.checkList.reduce((status, item) => status && item.isDone, true);
  }

  toggleCheckCompletion(text) {
    const item = this.checkList[this.getCheckListIndex(text)];
    item.isDone = !item.isDone;

    this.isCompleted = this.getAllCheckStatus();
  }

  removeFromCheckList(text) {
    const index = this.getCheckListIndex(text);
    this.checkList.splice(index, 1);
  }

  toggleCompletion() {
    this.isCompleted = !this.isCompleted;
  }

  getCreationTime() {
    return this.#creationTimeStamp;
  }
}

function createTask(name, description, priority, dueDate, checkList) {
  const modCheckList = (!checkList ? null : checkList.map((text) => ({ text, isDone: false })));
  return new Task(name, description, priority, dueDate, modCheckList);
}

export default createTask;
