"use strict";
var Firebase = require("firebase");
var _database;
var _auth;
var _storage;
function init(options) {
    var fb = Firebase.initializeApp(options);
    _database = fb.database();
    _auth = fb.auth();
    _storage = fb.storage();
}
exports.init = init;
function database() {
    if (!_database) {
        throw new Error("Database not initialized, did you forget to call init?");
    }
    return _database;
}
exports.database = database;
function auth() {
    if (!_auth) {
        throw new Error("Auth not initialized, did you forget to call init?");
    }
    return _auth;
}
exports.auth = auth;
function storage() {
    if (!_storage) {
        throw new Error("Storage not initialized, did you forget to call init?");
    }
    return _storage;
}
exports.storage = storage;
//# sourceMappingURL=init.js.map