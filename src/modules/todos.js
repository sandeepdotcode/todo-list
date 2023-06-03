import { endOfDay } from 'date-fns';

function createSubTask(text) {
  let isDone = false;
  const toggleCompletion = () => {
    isDone = !isDone;
  };
  const getCompletionStatus = () => isDone;
  return {
    text,
    toggleCompletion,
    getCompletionStatus,
  };
}

function checkListify(checkListArray) {
  return checkListArray.map((item) => createSubTask(item));
}

class Task {
  #creationTimeStamp;

  constructor(name, description, priority, dateString, checkList) {
    this.name = name;
    this.description = description;
    this.priority = priority; // 0 - no priority, 1 - high, 2 - med, 3 - low
    this.dueDate = endOfDay(new Date(dateString));
    this.checkList = checkList;
    this.isCompleted = false;

    this.#creationTimeStamp = Date.now();
  }

  addToCheckList(text) {
    if (!this.checkList) this.checkList = [];
    this.checkList.push(createSubTask(text));
  }

  getCheckListIndex(text) {
    return this.checkList.findIndex((item) => item.text === text);
  }

  getAllCheckStatus() {
    return this.checkList.reduce((status, item) => status && item.getCompletionStatus(), true);
  }

  getCheckListItemStatus(name) {
    const index = this.getCheckListIndex(name);
    if (index === -1) {
      console.log('checkListItem not found, cannot check status!');
      return null;
    }
    return this.checkList[index].getCompletionStatus();
  }

  toggleCheckCompletion(text) {
    const item = this.checkList[this.getCheckListIndex(text)];
    item.toggleCompletion();

    if (!this.isCompleted) {
      this.isCompleted = this.getAllCheckStatus();
    }
  }

  removeFromCheckList(text) {
    const index = this.getCheckListIndex(text);
    this.checkList.splice(index, 1);
  }

  modifyCheckList(newCheckNamesArray) {
    for (let i = 0; i < this.checkList.length; i += 1) {
      this.checkList[i].text = newCheckNamesArray[i];
    }
  }

  toggleCompletion() {
    this.isCompleted = !this.isCompleted;
  }

  getCreationTime() {
    return this.#creationTimeStamp;
  }
}

function createTask(name, description, priority, dueDate, checkList) {
  const modCheckList = Array.isArray(checkList) ? checkListify(checkList) : null;
  return new Task(name, description, priority, dueDate, modCheckList);
}

export default createTask;
