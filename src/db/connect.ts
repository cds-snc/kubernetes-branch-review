import { Connection } from "mongoose";

const mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);
mongoose.set("bufferCommands", false);
interface ConnectOptions {
  useNewUrlParser: boolean;
  auth?: {};
}

const connect = async (
  uri: string,
  user: string = "",
  password: string = ""
): Promise<Connection | false> => {
  if (!uri) {
    throw new Error("no uri passed to connect");
  }

  const mongodbUri: string = uri;
  let connect = null;

  const options: ConnectOptions = {
    useNewUrlParser: true
  };

  if (user) {
    options.auth = {
      user: user,
      password: password
    };
  }

  connect = await mongoose.connect(mongodbUri, options);

  return connect;
};

export const dbConnect = async (): Promise<Connection> => {
  const { DB_URI, DB_USER, DB_PASS } = process.env;

  const db = await connect(
    DB_URI,
    DB_USER,
    DB_PASS
  );
  if (!db) return;

  return db;
};
