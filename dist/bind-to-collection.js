"use strict";
const React = require("react");
const init_1 = require("./init");
function bindToCollection(innerKlass) {
    return class extends React.Component {
        constructor(props) {
            super(props);
            this.state = { status: 0 };
            const callback = this.updateData.bind(this);
            let reference = init_1.database().ref(props.firebaseRef);
            if (props.firebaseQuery) {
                reference = applyQuery(reference, props.firebaseQuery);
            }
            if (props.cacheLocally) {
                const localStorageData = checkLocalStorage(props.firebaseRef, props.firebaseQuery);
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
            let val = snapshot.val();
            if (!val || Object.keys(val).length === 0) {
                val = {};
            }
            this.setState({ data: val, status: 2 });
            if (this.props.cacheLocally) {
                saveToLocalStorage(this.props.firebaseRef, this.props.firebaseQuery, val);
            }
        }
    }
    ;
}
exports.bindToCollection = bindToCollection;
function localStorageKey(firebaseRef, query) {
    return `firebase-cache-collection:${firebaseRef}:${JSON.stringify(query)}`;
}
function saveToLocalStorage(firebaseRef, query, data) {
    localStorage.setItem(localStorageKey(firebaseRef, query), JSON.stringify(data));
}
function checkLocalStorage(firebaseRef, query) {
    const item = localStorage.getItem(localStorageKey(firebaseRef, query));
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