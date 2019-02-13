require = require("esm")(module); // eslint-disable-line no-global-assign
require("dotenv-safe").config();
module.exports = require("./src/server.js");
