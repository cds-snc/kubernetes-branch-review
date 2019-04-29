"use strict";
exports.__esModule = true;
exports.isMaster = function (event) {
    return event && event.ref && event.ref.indexOf("master") !== -1;
};
