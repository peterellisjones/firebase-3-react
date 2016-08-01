# firebase-3-react

Simple library to create React [container-components](https://medium.com/@learnreact/container-components-c0e67432e005#.8iw48488z) which bind Firebase data to React components. Also supports caching in local storage. Uses the Firebase 3 client.

## Install

Install with the NPM command:

```
npm install firebase-3-react --save
```

## Usage

This library was written in Typescript but can be used with either Javascript or Typescript. If you are using Typescript, you can import the .ts and .tsx files directly from `node_modules` as follows (note you may need to whitelist this directory with your Typescript compiler, see the end of this readme for how to do this with Webpack):

```typescript
import { init } from "../node_modules/firebase-3-react/src/index";
```

If using ES6 Javascript you can import the regular way ie:
```javascript
import { init } from "firebase-3-react";
```

## `init`

Use `init` to initialize the Firebase client. `init` *must* be called before `bindToCollection` or  `bindToItem`

Example:

```typescript
import { init } from "../node_modules/firebase-3-react/src/index";

init({
  apiKey: "example-api-key",
  authDomain: "example.firebaseapp.com",
  databaseURL: "https://example.firebaseio.com",
  storageBucket: "example.appspot.com",
});
```

## `bindToItem<T, P>`

`bindToItem` creates a one-way binding from an item at a firebase database reference. `T` is the type of the data returned from Firebase. `P` should include any other props you wish to pass to the component.

**Example:**

Suppose we have the following React component to display a comment:

**TYPESCRIPT**
```typescript
interface Props { //  Note that the component *MUST* require the prop `data: T;`
  data: string; // data represents the comment to be rendered
  fromAdmin?: boolean;
  verbose?: boolean;
}

class Comment extends React.Component<Props, {}> {
  public render(): JSX.Element {
    if (this.props.verbose) {
      console.log("Rendering comment");
    }
    if (this.props.fromAdmin) {
      return <div className="admin-comment">{this.props.data}</div>;
    }
    return <div>{this.props.data}</div>;
  }
}
```


**ES6 JAVASCRIPT**
```javascript
class Comment extends React.Component {
  public render() {
    if (this.props.verbose) {
      console.log("Rendering comment");
    }
    if (this.props.fromAdmin) {
      return <div className="admin-comment">{this.props.data}</div>;
    }
    return <div>{this.props.data}</div>;
  }
}
Comment.propTypes = {
  data: React.PropTypes.string.isRequired,
  fromAdmin: React.PropTypes.boolean,
  verbose: React.PropTypes.boolean,
};
```

We can create a container-component bound to this item with the following code:

```typescript
import { bindToItem } from "../node_modules/firebase-3-react/src/index";

// in Javascript this would simply be: const BoundComment = bindToItem(Comment);
const BoundComment = bindToItem<string, { fromAdmin: boolean, verbose: boolean }>(Comment);
```

Now we can use `BoundComment` in a React component like so:

```typescript
public renderComment(comment_id: string): JSX.Element {
  return <BoundComment firebaseRef={`comments/${comment_id}`} />;
}
```

Where `firebaseRef` is the [Firebase database reference](https://firebase.google.com/docs/database/web/retrieve-data) for the item to be retrieved.

#### Options

Here are the properties that can be passed to a bound component created using `bindToItem`:

* **firebaseRef** (string, required) The Firebase database reference for the data. This data will be passed to the wrapped component as `{ data: T }`, and will re-render when updated.

* **cacheLocally** (boolean, optional) Set this to `true` to cache the data in localStorage. The data will still be fetched from Firebase, but any cached data will be passed to the wrapped component while waiting for the response from Firebase.

* **storage** (Storage interface, optional) Set this to use a storage object other than `window.localStorage`. This object must expose the methods `getItem(key: string): string` and `setItem(key: string, value: string)`.

* **loader** (function, optional) This is a function returning a JSX element that will be displayed while data is being loaded from Firebase. By default nothing is shown while waiting for Firebase to respond. Note that any properties passed to the bound component will also be passed as an argument to this function.

* **...anything else...** Any other properties will be passed directly to the wrapped component.

Example with all options:

```typescript
public renderComment(comment_id: string): JSX.Element {
  return <BoundComment
    firebaseRef={`comments/${comment_id}`}
    cacheLocally={true}
    loader={(props: any) => { return <p>{"Loading, please wait..."}</p>; }}
  />;
}
```

...or in Javascript:

```javascript
function renderComment(comment_id) {
  return <BoundComment
    firebaseRef={`comments/${comment_id}`}
    cacheLocally={true}
    loader={(props) => { return <p>{"Loading, please wait..."}</p>; }}
  />;
}
```

## `bindToCollection<T, P>`

`bindToCollection` is similar to `bindToItem` except that it binds the component to a Firebase query. In `bindToItem<T, P>`, `T` is the type of the item retrieved from Firebase and is passed to the wrapped component as `{ data: T }`. For `bindToCollection<T, P>`, `T` now represents the type of the elements contained in the collection. The data is passed to the wrapped component as `{ data: { [id: string]: T }}`.

**Example:**

Suppose we have a component to render a list of comments:

```typescript
//  Note that the component *MUST* require the prop `data: { [id: string]: T };` (ie an object mapping a string id to items of type T)
interface Props {
  data: { [id: string]: string } // here `data` is an object mapping comment id to the comment;
  fromAdmin?: boolean;
  verbose?: boolean;
}

class Comments extends React.Component<Props, {}> {
  public render(): JSX.Element {
    if (this.props.verbose) {
      console.log("Rendering comments");
    }
    if (this.props.fromAdmin) {
      return <div className="admin-comments">{this.renderComments()}</div>;
    }
    return <div>{this.renderComments()}</div>;
  }

  private renderComments(): JSX.Element[] {
    const comments = this.props.data;
    return Object.keys(comments).map((id: string): JSX.Element => {
      const comment = comments[id];
      return <div key={id} className="comment">{comment}</div>
    });
  }
}
```

We can create a component-container bound to a list of comments with the following code:

```typescript
import { bindToCollection } from "../node_modules/firebase-3-react/src/index";

// in Javascript this would simply be: const BoundComments = bindToItem(Comment);
const BoundComments = bindToCollection<string, { fromAdmin: boolean, verbose: boolean }>(Comments);
```

...and use `BoundComments` in a React component like so:

```typescript
public renderComments(thread_id: string): JSX.Element {
  return <BoundComments
    firebaseRef={`comments`}
    firebaseQuery={{
      equalTo: { value: thread_id },
      orderByChild: "thread_id",
    }}
  />;
}
```

The component will automatically re-render whenever the query results are updated in Firebase.

#### Options

Here are the properties that can be passed to a bound component created using `bindToCollection`:

* **firebaseRef** (string, required) The Firebase database reference for the data. This data will be passed to the wrapped component as `{ data: T }`, and will re-render when updated.

* **firebaseQuery** (object, optional) A Firebase query to use to filter the results. See https://github.com/peterellisjones/firebase-3-react/blob/master/src/bind-to-collection.tsx for a list of arguments that can be passed to firebaseQuery.

* **cacheLocally** (boolean, optional) Set this to `true` to cache the data in localStorage. The data will still be fetched from Firebase, but any cached data will be passed to the wrapped component while waiting for the response from Firebase.

* **loader** (function, optional) This is a function returning a JSX element that will be displayed while data is being loaded from Firebase. By default nothing is shown while waiting for Firebase to respond. Note that any properties passed to the bound component will also be passed as an argument to this function.

* **...anything else...** Any other properties will be passed directly to the wrapped component.

## `database, auth, storage`

Import these to access the underlying Firebase 3 clients. See here for more details: [https://firebase.google.com/docs/web/setup#use_firebase_services](https://firebase.google.com/docs/web/setup#use_firebase_services).

Example:

```typescript
/// <reference path="node_modules/firebase-3-react/firebase.d.ts" />
import { auth } from "../node_modules/firebase-3-react/src/index";

auth.onAuthStateChanged((user: firebase.User) => {
  if (user && user.uid) {
    console.log(`Now logged in as user ${user.uid}`);
  }
});
```

## Caching

Setting `cacheLocally=true` will allow components to render instantly if the user has loaded data they depend on before. For `bindToItem` the cache is keyed by the Firebase database reference path (eg: `comments/123456`). For `bindToCollection`, the cache is keyed by the database reference path **and** the query if there is one. This means that, for example:
```typescript
<BoundComments
    firebaseRef={`comments`}
    firebaseQuery={{
      equalTo: { value: "123" },
      orderByChild: "user_id",
    }}
  />;
```
and
```typescript
<BoundComments
  firebaseRef={`comments`}
  firebaseQuery={{
    equalTo: { value: "ABC" },
    orderByChild: "user_id",
  }}
/>;
```
will be cached at different keys.

If `localStorage.setItem` fails (eg when the local storage quota has been exceed) it simply catches the error and writes it to the console. It does not re-raise the error.

## Webpack

If you use webpack with the typescript loader, you'll need to include the path `node_modules/firebase-3-react` to the list of directories parsed by the loader. eg:

```javascript
const config = {
  module: {
    loaders: [{
      test: /\.tsx?$/,
      loaders: ['babel-loader', 'ts-loader', 'tslint-loader'],
      include: [
        path.join(__dirname, 'src'),
        path.join(__dirname, 'node_modules', 'firebase-3-react') // add node_modules/firebase-3-react
      ]
    }
  }
  // ... etc
}
```
