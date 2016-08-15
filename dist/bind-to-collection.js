"use strict";
const React = require("react");
const init_1 = require("./init");
const lodash_1 = require("lodash");
function bindToCollection(innerKlass) {
    class BindToCollection extends React.Component {
        constructor(props) {
            super(props);
            this.reset(props, false);
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
        shouldComponentUpdate(nextProps, nextState) {
            if (nextProps.firebaseRef !== nextProps.firebaseRef) {
                return true;
            }
            if (!lodash_1.isEqual(this.props.firebaseQuery, nextProps.firebaseQuery)) {
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
        componentWillReceiveProps(nextProps) {
            if (this.props.firebaseRef !== nextProps.firebaseRef || !lodash_1.isEqual(this.props.firebaseQuery, nextProps.firebaseQuery)) {
                this.reset(nextProps, true);
            }
        }
        reset(props, useSetState) {
            const state = { status: 0 };
            if (props.cacheLocally) {
                const localStorageData = checkStorage(props.firebaseRef, props.firebaseQuery, props.storage);
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
            let reference = init_1.database().ref(props.firebaseRef);
            if (props.firebaseQuery) {
                reference = applyQuery(reference, props.firebaseQuery);
            }
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
            for (const id of lodash_1.difference(Object.keys(outerProps), BindToCollection.propKeys)) {
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
            let val = snapshot.val();
            if (!val || Object.keys(val).length === 0) {
                val = {};
            }
            this.setState({ data: val, status: 2 });
            if (this.props.cacheLocally) {
                saveToStorage(this.props.firebaseRef, this.props.firebaseQuery, val, this.props.storage);
            }
        }
    }
    BindToCollection.propKeys = ["firebaseRef", "cacheLocally", "firebaseQuery", "storage", "loader"];
    ;
    return BindToCollection;
}
exports.bindToCollection = bindToCollection;
function localStorageKey(firebaseRef, query) {
    return `firebase-cache-collection:${firebaseRef}:${(query && JSON.stringify(query)) || "all"}`;
}
function saveToStorage(firebaseRef, query, data, storageObject) {
    const storage = storageObject || window.localStorage;
    try {
        storage.setItem(localStorageKey(firebaseRef, query), JSON.stringify(data));
    }
    catch (err) {
        console.error(err.message);
    }
}
function checkStorage(firebaseRef, query, storageObject) {
    const storage = storageObject || window.localStorage;
    const item = storage.getItem(localStorageKey(firebaseRef, query));
    if (item) {
        return JSON.parse(item);
    }
}
function applyQuery(ref, query) {
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
//# sourceMappingURL=bind-to-collection.js.map