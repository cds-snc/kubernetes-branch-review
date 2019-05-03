import { longPoll } from "../lib";

test("receives done event when check is met", async () => {
  const poll = longPoll;
  poll.delay = 200;
  poll.check = () => {
    if (poll.counter >= 2) return true;
  };

  poll.eventEmitter.on("done", () => {
    expect(poll.counter).toEqual(2);
  });

  poll.start();
});
