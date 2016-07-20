# typescript-firebase-react

Simple library to create React containers to which Firebase data to components. Also supports caching in local storage.

## Usage

This library exposes three methods:

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
import { init } from "typescript-firebase-react"

init({
  apiKey: "example-api-key",
  authDomain: "example.firebaseapp.com",
  databaseURL: "https://example.firebaseio.com",
  storageBucket: "example.appspot.com",
});
```

### `bindToCollection<T>`

### `bindToItem<T>`
