import * as React from "react";
import { database } from "./init";
import { isEqual } from "lodash";
export function bindToItem(innerKlass) {
    return class extends React.Component {
        constructor(props) {
            super(props);
            this.reset(props, false);
        }
        componentWillReceiveProps(nextProps) {
            if (this.props.firebaseRef !== nextProps.firebaseRef) {
                this.reset(nextProps, true);
            }
        }
        shouldComponentUpdate(nextProps, nextState) {
            if (nextProps.firebaseRef !== nextProps.firebaseRef) {
                return true;
            }
            if (this.state.status === 0 && nextState.status !== 0) {
                return true;
            }
            if (!isEqual(this.buildInnerProps(this.props), this.buildInnerProps(nextProps))) {
                return true;
            }
            return !isEqual(this.state.data, nextState.data);
        }
        render() {
            const innerProps = this.buildInnerProps(this.props);
            if (this.state.status === 0) {
                if (this.props.loader) {
                    return this.props.loader(innerProps);
                }
                return null;
            }
            return React.createElement(innerKlass, innerProps);
        }
        componentWillUnmount() {
            if (this.unbind) {
                this.unbind();
            }
        }
        reset(props, useSetState) {
            const state = { status: 0 };
            if (this.props.cacheLocally) {
                const localStorageData = checkStorage(props.firebaseRef, props.storage);
                if (localStorageData) {
                    state.data = localStorageData;
                    state.status = 1;
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
            }
            else {
                this.state = state;
            }
        }
        buildInnerProps(props) {
            const innerProps = { data: this.state.data };
            for (const id of Object.keys(props)) {
                if (id !== "firebaseRef" && id !== "cacheLocally" && id !== "firebaseQuery" && id !== "storage" && id !== "loader") {
                    innerProps[id] = props[id];
                }
            }
            return innerProps;
        }
        updateData(snapshot) {
            const val = snapshot.val();
            this.setState({ data: val, status: 2 });
            if (this.props.cacheLocally) {
                saveToStorage(this.props.firebaseRef, val, this.props.storage);
            }
        }
    }
    ;
}
function localStorageKey(firebaseRef) {
    return `firebase-cache-item:${firebaseRef}`;
}
function saveToStorage(firebaseRef, data, customStorage) {
    const storage = customStorage || window.localStorage;
    try {
        storage.setItem(localStorageKey(firebaseRef), JSON.stringify(data));
    }
    catch (err) {
        console.error(err.message);
    }
}
function checkStorage(firebaseRef, customStorage) {
    const storage = customStorage || window.localStorage;
    const item = storage.getItem(localStorageKey(firebaseRef));
    if (item) {
        return JSON.parse(item);
    }
}
//# sourceMappingURL=bind-to-item.js.map