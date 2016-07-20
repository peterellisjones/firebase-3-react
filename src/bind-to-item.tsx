import * as React from "react";
import { database } from "./init";

/// <reference path="react.d.ts" />

const enum Status {
  Pending,
  LoadedFromLocalStorage,
  LoadedFromFirebase
}

interface IProps {
  firebaseRef: string;
  cacheLocally?: boolean;
  loader?: (any) => JSX.Element;
}

interface IState<T>{
  status: Status;
  data?: T;
}

export function bindToItem<T, P>(innerKlass: React.ComponentClass<{data: T} & P>): React.ComponentClass<IProps & P> {
  return class extends React.Component<IProps & P, IState<T>> {
    private unbind: () => void;

    constructor(props: IProps & P) {
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
      // copy all props
      const innerProps = { data: this.state.data };
      for (const id of Object.keys(this.props)) {
        if (id !== "firebaseRef" && id !== "cacheLocally" && id !== "loader") {
          innerProps[id] = this.props[id];
        }
      }

      if (this.state.status === Status.Pending) {
        if (this.props.loader) {
          return this.props.loader(innerProps);
        }
        return null;
      }

      innerProps.data = this.state.data;

      return React.createElement<{data: T} & P>(innerKlass, innerProps as {data: T} & P);
    }

    public componentWillUnmount() {
      if (this.unbind) {
        this.unbind();
      }
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
  localStorage.setItem(localStorageKey(firebaseRef), JSON.stringify(data));
}

function checkLocalStorage<T>(firebaseRef: string): T {
  const item = localStorage.getItem(localStorageKey(firebaseRef));

  if (item) {
    return JSON.parse(item);
  }
}
