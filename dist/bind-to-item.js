"use strict";
const React = require("react");
const init_1 = require("./init");
const lodash_1 = require("lodash");
function bindToItem(innerKlass) {
    class BindToItem extends React.Component {
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
            if (!lodash_1.isEqual(this.buildOtherProps(this.props), this.buildOtherProps(nextProps))) {
                return true;
            }
            return !lodash_1.isEqual(this.state.data, nextState.data);
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
            const reference = init_1.database().ref(props.firebaseRef);
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
        buildOtherProps(outerProps) {
            const otherProps = {};
            for (const id of lodash_1.difference(Object.keys(outerProps), BindToItem.propKeys)) {
                otherProps[id] = outerProps[id];
            }
            return otherProps;
        }
        buildInnerProps(outerProps) {
            const innerProps = this.buildOtherProps(outerProps);
            innerProps.data = this.state.data;
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
    BindToItem.propKeys = ["firebaseRef", "cacheLocally", "storage", "loader"];
    ;
    return BindToItem;
}
exports.bindToItem = bindToItem;
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