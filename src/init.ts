import * as Firebase from "firebase";

/// <reference path="../firebase.d.ts" />

let _database: Firebase.database.Database;
let _auth: Firebase.auth.Auth;
let _storage: Firebase.storage.Storage;

interface FirebaseOptions {
  apiKey: string;
  authDomain: string;
  databaseURL: string;
  storageBucket: string;
}

export function init(options: FirebaseOptions) {
  const fb = Firebase.initializeApp(options);

  _database = fb.database();
  _auth = fb.auth();
  _storage = fb.storage();
}

export function database(): Firebase.database.Database {
  if (!_database) {
    throw new Error("Database not initialized, did you forget to call init?");
  }

  return _database;
}

export function auth(): Firebase.auth.Auth {
  if (!_auth) {
    throw new Error("Auth not initialized, did you forget to call init?");
  }

  return _auth;
}

export function storage(): Firebase.storage.Storage {
  if (!_storage) {
    throw new Error("Storage not initialized, did you forget to call init?");
  }

  return _storage;
}
