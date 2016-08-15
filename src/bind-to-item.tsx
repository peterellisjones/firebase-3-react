import * as React from "react";
import { database } from "./init";
import { isEqual, difference } from "lodash";

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
  debug?: boolean;
} & P;

interface Storage {
  getItem(key: string): string;
  setItem(key: string, value: string);
}

export function bindToItem<T, P>(innerKlass: React.ComponentClass<{data: T} & P>): React.ComponentClass<OuterProps<P>> {
  class BindToItem extends React.Component<OuterProps<P>, IState<T>> {
    private static propKeys = ["debug", "firebaseRef", "cacheLocally", "storage", "loader"];
    private unbind: () => void;

    constructor(props: OuterProps<P>) {
      super(props);

      this.reset(props, false);
    }

    public componentWillReceiveProps(nextProps: OuterProps<P>) {
      // reset if reference changes
      if (this.props.firebaseRef !== nextProps.firebaseRef) {
        this.debug("Reseting since Firebase reference has changed");
        this.reset(nextProps, true);
      }
    }

    public shouldComponentUpdate(nextProps: OuterProps<P>, nextState: IState<T>): boolean {
      // Yes if reference has changed
      if (nextProps.firebaseRef !== nextProps.firebaseRef) {
        this.debug("Updating since Firebase reference has changed");
        return true;
      }

      // Yes if finished loading
      if (this.state.status === Status.Pending && nextState.status !== Status.Pending) {
        this.debug("Updating since status has changed");
        return true;
      }

      // Yes if user-supplier props have changed
      if (!isEqual(this.buildOtherProps(this.props), this.buildOtherProps(nextProps))) {
        this.debug("Updating since user-supplied props have changed");
        return true;
      }

      // Otherwise do deep comparison of data
      if (!isEqual(this.state.data, nextState.data)) {
        this.debug("Updating since data has changed");
        return true;
      }

      return false;
    }

    public render(): JSX.Element {
      this.debug("Rendering");
      const innerProps = this.buildInnerProps(this.props);

      if (this.state.status === Status.Pending) {
        if (this.props.loader) {
          return this.props.loader(innerProps);
        }
        return null;
      }

      return React.createElement<InnerProps<T, P>>(innerKlass, innerProps);
    }

    public componentWillUnmount() {
      this.debug("Unmounting");
      if (this.unbind) {
        this.debug("Unbinding Firebase listener");
        this.unbind();
      }
    }

    private reset(props: OuterProps<P>, useSetState?: boolean) {
      const state: IState<T> = { status: Status.Pending };

      if (this.props.cacheLocally) {
        this.debug("Checking storage for cached data");
        const localStorageData = checkStorage<T>(props.firebaseRef, props.storage);
        if (localStorageData) {
          this.debug("Cache hit");
          state.data = localStorageData;
          state.status = Status.LoadedFromLocalStorage;
        }
      }

      if (this.unbind) {
        this.debug("Unbinding deprecated Firebase listener");
        this.unbind();
        this.unbind = undefined;
      }

      const callback = this.updateData.bind(this);
      const reference = database().ref(props.firebaseRef);
      this.debug("Registering Firebase listener");
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

    private buildOtherProps(outerProps: OuterProps<P>): P {
      const otherProps = {} as P;

      for (const id of difference(Object.keys(outerProps), BindToItem.propKeys)) {
        otherProps[id] = outerProps[id];
      }

      return otherProps;
    }

    private buildInnerProps(outerProps: OuterProps<P>): InnerProps<T, P> {
      const innerProps = this.buildOtherProps(outerProps) as InnerProps<T, P> ;
      innerProps.data = this.state.data;

      return innerProps;
    }

    private updateData(snapshot: firebase.database.DataSnapshot) {
      const val = snapshot.val() as T;
      this.setState({ data: val, status: Status.LoadedFromFirebase });

      if (this.props.cacheLocally) {
        saveToStorage(this.props.firebaseRef, val, this.props.storage);
      }
    }

    private debug(message: string) {
      if (this.props.debug) {
        console.log(`bindToItem[${this.props.firebaseRef}]: ${message}`);
      }
    }
  };

  return BindToItem;
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
