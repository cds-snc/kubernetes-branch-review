import { EventEmitter } from "events";

export interface LongPoll {
  interval: null | number;
  counter: number;
  delay: number;
  id: string;
  eventEmitter: EventEmitter;
  check: () => void;
  handle: () => void;
  start: () => void;
  clear: () => void;
}
