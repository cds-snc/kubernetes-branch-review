"use strict";
exports.__esModule = true;
var isMaster1_1 = require("./isMaster1");
exports.getAction = function (req) {
    var action;
    var body = req.body;
    if (body && body.action) {
        // create
        // close
        // reopen
        action = body.action;
    }
    else {
        // get action from other type of event
        if (!isMaster1_1.isMaster(body) && body.repository) {
            action = "updated";
        }
    }
    return action;
};
