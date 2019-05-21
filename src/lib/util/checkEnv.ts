export const checkEnv = () => {
  if (process.env.NODE_ENV === "test") {
    // don't spin up for test env
    // @todo see if there's a way to test worker process using jest
    return false;
  }

  return true;
};
