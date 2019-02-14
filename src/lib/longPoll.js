const events = require("events");

export const longPoll = {
  interval: null,
  counter: 0,
  delay: 5000,
  eventEmitter: new events.EventEmitter(),
  check: () => {},
  handle: function() {
    this.counter++;
    if (this.check()) {
      this.eventEmitter.emit("done");
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
