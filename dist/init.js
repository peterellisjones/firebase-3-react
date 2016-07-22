import * as Firebase from "firebase";
let _database;
let _auth;
let _storage;
export function init(options) {
    const fb = Firebase.initializeApp(options);
    _database = fb.database();
    _auth = fb.auth();
    _storage = fb.storage();
}
export function database() {
    if (!_database) {
        throw new Error("Database not initialized, did you forget to call init?");
    }
    return _database;
}
export function auth() {
    if (!_auth) {
        throw new Error("Auth not initialized, did you forget to call init?");
    }
    return _auth;
}
export function storage() {
    if (!_storage) {
        throw new Error("Storage not initialized, did you forget to call init?");
    }
    return _storage;
}
//# sourceMappingURL=init.js.map