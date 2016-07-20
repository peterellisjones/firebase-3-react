import * as React from "react";
import { database } from "./init";

/// <reference path="react.d.ts" />

const enum Status {
  Pending,
  LoadedFromLocalStorage,
  LoadedFromFirebase
}

interface IFirebaseQuery {
  endAt?: {
    value?: number | string | boolean;
    key?: string;
  };
  equalTo?: {
    value?: number | string | boolean;
    key?: string;
  };
  limitToFirst?: number;
  limitToLast?: number;
  orderByChild?: string;
  orderByKey?: boolean;
  orderByPriority?: boolean;
  orderByValue?: boolean;
  startAt?: {
    value?: number | string | boolean;
    key?: string;
  };
}

interface IProps {
  firebaseRef: string;
  firebaseQuery?: IFirebaseQuery;
  cacheLocally?: boolean;
  loader?: (any) => JSX.Element;
}

interface IState<T>{
  status: Status;
  data?: { [id: string]: T };
}

export function bindToCollection<T, X>(innerKlass: React.ComponentClass<{data: { [id: string]: T }} & X>): React.ComponentClass<IProps & X> {
  return class extends React.Component<IProps & X, IState<T>> {
    private unbind: () => void;

    constructor(props: IProps & X) {
      super(props);

      this.state = { status: Status.Pending };

      const callback = this.updateData.bind(this);
      let reference: firebase.database.Query = database().ref(props.firebaseRef);
      if (props.firebaseQuery) {
        reference = applyQuery(reference, props.firebaseQuery);
      }

      if (props.cacheLocally) {
        const localStorageData = checkLocalStorage<{ [id: string]: T }>(props.firebaseRef, props.firebaseQuery);
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
      if (this.state.status === Status.Pending) {
        return null;
      }

      // copy all props
      const innerProps = { data: this.state.data };
      for (const id of Object.keys(this.props)) {
        if (id !== "firebaseRef" && id !== "cacheLocally" && id !== "firebaseQuery") {
          innerProps[id] = this.props[id];
        }
      }

      return React.createElement<{data: { [id: string]: T }} & X>(innerKlass, innerProps as {data: { [id: string]: T }} & X);
    }

    public componentWillUnmount() {
      if (this.unbind) {
        this.unbind();
      }
    }

    private updateData(snapshot: firebase.database.DataSnapshot) {
      let val = snapshot.val() as { [id: string]: T };

      if (!val || Object.keys(val).length === 0) {
        val = {};
      }

      this.setState({ data: val, status: Status.LoadedFromFirebase });

      if (this.props.cacheLocally) {
        saveToLocalStorage(this.props.firebaseRef, this.props.firebaseQuery, val);
      }
    }
  };
}

function localStorageKey(firebaseRef: string, query: IFirebaseQuery): string {
  return `firebase-cache-collection:${firebaseRef}:${JSON.stringify(query)}`;
}

function saveToLocalStorage<T>(firebaseRef: string, query: IFirebaseQuery, data: T) {
  localStorage.setItem(localStorageKey(firebaseRef, query), JSON.stringify(data));
}

function checkLocalStorage<T>(firebaseRef: string, query: IFirebaseQuery): T {
  const item = localStorage.getItem(localStorageKey(firebaseRef, query));

  if (item) {
    return JSON.parse(item);
  }
}

function applyQuery(ref: firebase.database.Query, query: IFirebaseQuery): firebase.database.Query {
  if (query.startAt !== undefined) {
    ref = ref.startAt(query.startAt.value, query.startAt.key);
  }

  if (query.equalTo !== undefined) {
    ref = ref.equalTo(query.equalTo.value, query.equalTo.key);
  }

  if (query.endAt !== undefined) {
    ref = ref.endAt(query.endAt.value, query.endAt.key);
  }

  if (query.orderByValue !== undefined) {
    ref = ref.orderByValue();
  }

  if (query.orderByPriority !== undefined) {
    ref = ref.orderByPriority();
  }

  if (query.orderByKey !== undefined) {
    ref = ref.orderByKey();
  }

  if (query.orderByChild !== undefined) {
    ref = ref.orderByChild(query.orderByChild);
  }

  if (query.limitToLast !== undefined) {
    ref = ref.limitToLast(query.limitToLast);
  }

  if (query.limitToFirst !== undefined) {
    ref = ref.limitToFirst(query.limitToFirst);
  }

  return ref;
}
