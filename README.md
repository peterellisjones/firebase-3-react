# firebase-3-react

Simple library to create React containers which bind Firebase data to components. Also supports caching in local storage. Uses the Firebase 3 client.

## Usage

This library can be used with either Javascript or Typescript. If using Javascript simply omit the type annotations in the code below.

### `init`

`init` has the following type signature and is used to initialize the Firebase client. It *must* be called before `bindToCollection` or  `bindToItem`

```typescript
interface FirebaseOptions {
  apiKey: string;
  authDomain: string;
  databaseURL: string;
  storageBucket: string;
}

init(options: FirebaseOptions);
```

Example:

```typescript
import { init } from "firebase-3-react"

init({
  apiKey: "example-api-key",
  authDomain: "example.firebaseapp.com",
  databaseURL: "https://example.firebaseio.com",
  storageBucket: "example.appspot.com",
});
```

### `bindToItem<T, P>`

`bindToItem` creates a one-way binding from an item at a firebase path. `T` is the type of the data returned from Firebase. `P` is the type of any other props given to the component.

Example:

```
interface Props {
  data: string;
  isBold: boolean;
}

const username = (props: Props): JSX.Element {
  if (props.isBold) {
    return
  }
}



```


### `bindToCollection<T, P>`


### `database, auth, storage`

Import these to access the underlying Firebase 3 clients. See here for more details: [https://firebase.google.com/docs/web/setup#use_firebase_services](https://firebase.google.com/docs/web/setup#use_firebase_services).

Example:

```typescript
/// <reference path="node_modules/firebase-3-react/firebase.d.ts" />
import { auth } from "firebase-3-react"

auth.onAuthStateChanged((user: firebase.User) => {
  if (user && user.uid) {
    console.log(`Now logged in as user ${user.uid}`);
  }
});
```
