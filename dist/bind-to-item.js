import * as React from "react";
import { database } from "./init";
export function bindToItem(innerKlass) {
    return class extends React.Component {
        constructor(props) {
            super(props);
            this.state = { status: 0 };
            const callback = this.updateData.bind(this);
            const reference = database().ref(props.firebaseRef);
            if (this.props.cacheLocally) {
                const localStorageData = checkStorage(props.firebaseRef, props.storage);
                if (localStorageData) {
                    this.state.data = localStorageData;
                    this.state.status = 1;
                }
            }
            reference.on("value", callback);
            this.unbind = () => {
                reference.off("value", callback);
            };
        }
        render() {
            const innerProps = this.innerProps();
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
        innerProps() {
            const innerProps = { data: this.state.data };
            for (const id of Object.keys(this.props)) {
                if (id !== "firebaseRef" && id !== "cacheLocally" && id !== "firebaseQuery" && id !== "storage") {
                    innerProps[id] = this.props[id];
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