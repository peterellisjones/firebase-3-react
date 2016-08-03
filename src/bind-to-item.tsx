import * as React from "react";
import { database } from "./init";
import { isEqual } from "lodash";

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
  storage?: Storage;
  loader?: (props: P) => JSX.Element;
} & P;

interface Storage {
  getItem(key: string): string;
  setItem(key: string, value: string);
}

export function bindToItem<T, P>(innerKlass: React.ComponentClass<{data: T} & P>): React.ComponentClass<OuterProps<P>> {
  return class extends React.Component<OuterProps<P>, IState<T>> {
    private unbind: () => void;

    constructor(props: OuterProps<P>) {
      super(props);

      this.reset(props, false);
    }

    public componentWillReceiveProps(nextProps: OuterProps<P>) {
      // reset if reference changes
      if (this.props.firebaseRef !== nextProps.firebaseRef) {
        this.reset(nextProps, true);
      }
    }

    public shouldComponentUpdate(nextProps: OuterProps<P>, nextState: IState<T>): boolean {
      // Yes if reference has changed
      if (nextProps.firebaseRef !== nextProps.firebaseRef) {
        return true;
      }

      // Yes if finished loading
      if (this.state.status === Status.Pending && nextState.status !== Status.Pending) {
        return true;
      }

      // Otherwise do deep comparison of data
      return !isEqual(this.state.data, nextState.data);
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

    private reset(props: OuterProps<P>, useSetState?: boolean) {
      const state: IState<T> = { status: Status.Pending };

      if (this.props.cacheLocally) {
        const localStorageData = checkStorage<T>(props.firebaseRef, props.storage);
        if (localStorageData) {
          state.data = localStorageData;
          state.status = Status.LoadedFromLocalStorage;
        }
      }

      if (this.unbind) {
        this.unbind();
        this.unbind = undefined;
      }

      const callback = this.updateData.bind(this);
      const reference = database().ref(props.firebaseRef);
      reference.on("value", callback);

      this.unbind = () => {
        reference.off("value", callback);
      };

      if (useSetState) {
        this.setState(state);
      } else {
        this.state = state;
      }
    }

    private innerProps(): InnerProps<T, P> {
      const innerProps = { data: this.state.data } as InnerProps<T, P> ;
      for (const id of Object.keys(this.props)) {
        if (id !== "firebaseRef" && id !== "cacheLocally" && id !== "firebaseQuery" && id !== "storage") {
          innerProps[id] = this.props[id];
        }
      }

      return innerProps;
    }

    private updateData(snapshot: firebase.database.DataSnapshot) {
      const val = snapshot.val() as T;
      this.setState({ data: val, status: Status.LoadedFromFirebase });

      if (this.props.cacheLocally) {
        saveToStorage(this.props.firebaseRef, val, this.props.storage);
      }
    }
  };
}

function localStorageKey(firebaseRef: string): string {
  return `firebase-cache-item:${firebaseRef}`;
}

function saveToStorage<T>(firebaseRef: string, data: T, customStorage?: Storage) {
  const storage = customStorage || window.localStorage;
  try {
    storage.setItem(localStorageKey(firebaseRef), JSON.stringify(data));
  } catch (err) {
    console.error(err.message);
  }

}

function checkStorage<T>(firebaseRef: string, customStorage?: Storage): T {
  const storage = customStorage || window.localStorage;
  const item = storage.getItem(localStorageKey(firebaseRef));

  if (item) {
    return JSON.parse(item);
  }
}
