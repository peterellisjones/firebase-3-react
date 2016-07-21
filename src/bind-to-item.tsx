import * as React from "react";
import { database } from "./init";

/// <reference path="../react.d.ts" />

const enum Status {
  Pending,
  LoadedFromLocalStorage,
  LoadedFromFirebase
}

interface IProps<P> {
  firebaseRef: string;
  cacheLocally?: boolean;
  loader?: (props: P) => JSX.Element;
}

interface IState<T>{
  status: Status;
  data?: T;
}

type InnerProps<T, P> = { data: T} & P;
type OuterProps<P> = {
  firebaseRef: string;
  cacheLocally?: boolean;
  loader?: (props: P) => JSX.Element;
} & P;


export function bindToItem<T, P>(innerKlass: React.ComponentClass<{data: T} & P>): React.ComponentClass<OuterProps<P>> {
  return class extends React.Component<OuterProps<P>, IState<T>> {
    private unbind: () => void;

    constructor(props: OuterProps<P>) {
      super(props);

      this.state = { status: Status.Pending };

      const callback = this.updateData.bind(this);
      const reference = database().ref(props.firebaseRef);

      if (this.props.cacheLocally) {
        const localStorageData = checkLocalStorage<T>(props.firebaseRef);
        if (localStorageData) {
          this.state.data = localStorageData;
          this.state.status = Status.LoadedFromLocalStorage;
        }
      }

      reference.on("value", callback);

      this.unbind = () => {
        reference.off("value", callback);
      };
    }

    public render(): JSX.Element {
      const innerProps = this.innerProps();

      if (this.state.status === Status.Pending) {
        if (this.props.loader) {
          return this.props.loader(innerProps);
        }
        return null;
      }

      return React.createElement<InnerProps<T, P>>(innerKlass, innerProps);
    }

    public componentWillUnmount() {
      if (this.unbind) {
        this.unbind();
      }
    }

    private innerProps(): InnerProps<T, P> {
      const innerProps = { data: this.state.data } as InnerProps<T, P> ;
      for (const id of Object.keys(this.props)) {
        if (id !== "firebaseRef" && id !== "cacheLocally" && id !== "firebaseQuery") {
          innerProps[id] = this.props[id];
        }
      }

      return innerProps;
    }

    private updateData(snapshot: firebase.database.DataSnapshot) {
      const val = snapshot.val() as T;
      this.setState({ data: val, status: Status.LoadedFromFirebase });

      if (this.props.cacheLocally) {
        saveToLocalStorage(this.props.firebaseRef, val);
      }
    }
  };
}

function localStorageKey(firebaseRef: string): string {
  return `firebase-cache-item:${firebaseRef}`;
}

function saveToLocalStorage<T>(firebaseRef: string, data: T) {
  try {
    localStorage.setItem(localStorageKey(firebaseRef), JSON.stringify(data));
  } catch (err) {
    console.error(err.message);
  }

}

function checkLocalStorage<T>(firebaseRef: string): T {
  const item = localStorage.getItem(localStorageKey(firebaseRef));

  if (item) {
    return JSON.parse(item);
  }
}
