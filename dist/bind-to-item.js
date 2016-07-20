"use strict";
const React = require("react");
const init_1 = require("./init");
function bindToItem(innerKlass) {
    return class extends React.Component {
        constructor(props) {
            super(props);
            this.state = { status: 0 };
            const callback = this.updateData.bind(this);
            const reference = init_1.database().ref(props.firebaseRef);
            if (this.props.cacheLocally) {
                const localStorageData = checkLocalStorage(props.firebaseRef);
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
                if (id !== "firebaseRef" && id !== "cacheLocally" && id !== "firebaseQuery") {
                    innerProps[id] = this.props[id];
                }
            }
            return innerProps;
        }
        updateData(snapshot) {
            const val = snapshot.val();
            this.setState({ data: val, status: 2 });
            if (this.props.cacheLocally) {
                saveToLocalStorage(this.props.firebaseRef, val);
            }
        }
    }
    ;
}
exports.bindToItem = bindToItem;
function localStorageKey(firebaseRef) {
    return `firebase-cache-item:${firebaseRef}`;
}
function saveToLocalStorage(firebaseRef, data) {
    localStorage.setItem(localStorageKey(firebaseRef), JSON.stringify(data));
}
function checkLocalStorage(firebaseRef) {
    const item = localStorage.getItem(localStorageKey(firebaseRef));
    if (item) {
        return JSON.parse(item);
    }
}
//# sourceMappingURL=bind-to-item.js.map