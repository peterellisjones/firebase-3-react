"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var React = require("react");
var init_1 = require("./init");
var lodash_1 = require("lodash");
function bindToCollection(innerKlass) {
    var BindToCollection = (function (_super) {
        __extends(BindToCollection, _super);
        function BindToCollection(props) {
            _super.call(this, props);
            this.reset(props, false);
        }
        BindToCollection.prototype.render = function () {
            this.debug("Rendering");
            var innerProps = this.buildInnerProps(this.props);
            if (this.state.status === 0) {
                if (this.props.loader) {
                    return this.props.loader(innerProps);
                }
                return null;
            }
            return React.createElement(innerKlass, innerProps);
        };
        BindToCollection.prototype.componentWillUnmount = function () {
            this.debug("Unmounting");
            if (this.unbind) {
                this.debug("Unbinding Firebase listener");
                this.unbind();
            }
        };
        BindToCollection.prototype.shouldComponentUpdate = function (nextProps, nextState) {
            if (nextProps.firebaseRef !== nextProps.firebaseRef) {
                this.debug("Updating since Firebase reference has changed");
                return true;
            }
            if (!lodash_1.isEqual(this.props.firebaseQuery, nextProps.firebaseQuery)) {
                this.debug("Updating since Firebase query has changed");
                return true;
            }
            if (this.state.status === 0 && nextState.status !== 0) {
                this.debug("Updating since status has changed");
                return true;
            }
            if (!lodash_1.isEqual(this.buildOtherProps(this.props), this.buildOtherProps(nextProps))) {
                this.debug("Updating since user-supplied props have changed");
                return true;
            }
            if (!lodash_1.isEqual(this.state.data, nextState.data)) {
                this.debug("Updating since data has changed");
                return true;
            }
            return false;
        };
        BindToCollection.prototype.componentWillReceiveProps = function (nextProps) {
            if (this.props.firebaseRef !== nextProps.firebaseRef || !lodash_1.isEqual(this.props.firebaseQuery, nextProps.firebaseQuery)) {
                this.debug("Reseting since Firebase reference or query have changed");
                this.reset(nextProps, true);
            }
        };
        BindToCollection.prototype.reset = function (props, useSetState) {
            var state = { status: 0 };
            if (props.cacheLocally) {
                this.debug("Checking storage for cached data");
                var localStorageData = checkStorage(props.firebaseRef, props.firebaseQuery, props.storage);
                if (localStorageData) {
                    this.debug("Cache hit");
                    state.data = localStorageData;
                    state.status = 1;
                }
            }
            if (this.unbind) {
                this.debug("Unbinding deprecated Firebase listener");
                this.unbind();
                this.unbind = undefined;
            }
            var callback = this.updateData.bind(this);
            var reference = init_1.database().ref(props.firebaseRef);
            if (props.firebaseQuery) {
                reference = applyQuery(reference, props.firebaseQuery);
            }
            this.debug("Registering Firebase listener");
            reference.on("value", callback);
            this.unbind = function () {
                reference.off("value", callback);
            };
            if (useSetState) {
                this.setState(state);
            }
            else {
                this.state = state;
            }
        };
        BindToCollection.prototype.buildOtherProps = function (outerProps) {
            var otherProps = {};
            for (var _i = 0, _a = lodash_1.difference(Object.keys(outerProps), BindToCollection.propKeys); _i < _a.length; _i++) {
                var id = _a[_i];
                otherProps[id] = outerProps[id];
            }
            return otherProps;
        };
        BindToCollection.prototype.buildInnerProps = function (outerProps) {
            var innerProps = this.buildOtherProps(outerProps);
            innerProps.data = this.state.data;
            return innerProps;
        };
        BindToCollection.prototype.updateData = function (snapshot) {
            var val = snapshot.val();
            if (!val || Object.keys(val).length === 0) {
                val = {};
            }
            this.setState({ data: val, status: 2 });
            if (this.props.cacheLocally) {
                saveToStorage(this.props.firebaseRef, this.props.firebaseQuery, val, this.props.storage);
            }
        };
        BindToCollection.prototype.debug = function (message) {
            if (this.props.debug) {
                console.log("bindToCollection[" + this.props.firebaseRef + "]: " + message);
            }
        };
        BindToCollection.propKeys = ["debug", "firebaseRef", "cacheLocally", "firebaseQuery", "storage", "loader"];
        return BindToCollection;
    }(React.Component));
    ;
    return BindToCollection;
}
exports.bindToCollection = bindToCollection;
function localStorageKey(firebaseRef, query) {
    return "firebase-cache-collection:" + firebaseRef + ":" + ((query && JSON.stringify(query)) || "all");
}
function saveToStorage(firebaseRef, query, data, storageObject) {
    var storage = storageObject || window.localStorage;
    try {
        storage.setItem(localStorageKey(firebaseRef, query), JSON.stringify(data));
    }
    catch (err) {
        console.error(err.message);
    }
}
function checkStorage(firebaseRef, query, storageObject) {
    var storage = storageObject || window.localStorage;
    var item = storage.getItem(localStorageKey(firebaseRef, query));
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
    if (query.orderByValue) {
        ref = ref.orderByValue();
    }
    if (query.orderByPriority) {
        ref = ref.orderByPriority();
    }
    if (query.orderByKey) {
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