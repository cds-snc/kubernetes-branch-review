const events = require("events");

export const longPoll = {
  interval: null,
  counter: 0,
  delay: 5000,
  eventEmitter: new events.EventEmitter(),
  check: () => {},
  result: {},
  handle: async function() {
    this.counter++;
    const result = await this.check();
    if (result) {
      this.eventEmitter.emit("done", result);
      this.clear();
    }
  },
  start: function() {
    if (this.interval) {
      this.clear();
    }
    this.interval = setInterval(() => {
      this.handle();
    }, this.delay);
  },
  clear: function() {
    clearInterval(this.interval);
  }
};
