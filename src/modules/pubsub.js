import { addNewProject } from './app-controller';

const pubSub = {
  events: {},

  subscribe(eventName, fn) {
    this.events[eventName] = this.events[eventName] || [];
    this.events[eventName].push(fn);
  },

  unsubscribe(eventName, fn) {
    if (this.events[eventName]) {
      this.events[eventName] = this.events[eventName].filter((f) => f !== fn);
    }
  },

  publish(eventName, data) {
    if (this.events[eventName]) {
      this.events[eventName].forEach((func) => {
        func(data);
      });
    } else { console.log(data); }
  },
};

(function addEvents() {
  pubSub.subscribe('projectAdded', addNewProject);
}());

export default pubSub;
