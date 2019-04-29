const events = require("events");
import { LongPoll } from "../interfaces/LongPoll";

export const longPoll: LongPoll = {
  interval: null,
  counter: 0,
  delay: 5000,
  id: "",
  eventEmitter: new events.EventEmitter(),
  check: () => {
    return {};
  },
  handle: async function() {
    this.counter++;
    const result = await this.check();
    if (result) {
      this.eventEmitter.emit(`done-${this.id}`, result);
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
