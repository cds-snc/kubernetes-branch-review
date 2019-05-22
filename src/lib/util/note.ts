import chalk from "chalk";
const log = console.log;

export const note = (message: string) => {
  log(chalk.black.bgGreen("\n\n" + message));
};

export const noteError = (message: string, e: Error) => {
  log(chalk.black.bgYellow("\n\n" + message));
  console.log("=============================================");
  console.log(e);
  console.log("=============================================");
};
