"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var React = require("react");
var init_1 = require("./init");
var lodash_1 = require("lodash");
function bindToItem(innerKlass) {
    var BindToItem = (function (_super) {
        __extends(BindToItem, _super);
        function BindToItem(props) {
            _super.call(this, props);
            this.reset(props, false);
        }
        BindToItem.prototype.componentWillReceiveProps = function (nextProps) {
            if (this.props.firebaseRef !== nextProps.firebaseRef) {
                this.debug("Reseting since Firebase reference has changed");
                this.reset(nextProps, true);
            }
        };
        BindToItem.prototype.shouldComponentUpdate = function (nextProps, nextState) {
            if (nextProps.firebaseRef !== nextProps.firebaseRef) {
                this.debug("Updating since Firebase reference has changed");
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
        BindToItem.prototype.render = function () {
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
        BindToItem.prototype.componentWillUnmount = function () {
            this.debug("Unmounting");
            if (this.unbind) {
                this.debug("Unbinding Firebase listener");
                this.unbind();
            }
        };
        BindToItem.prototype.reset = function (props, useSetState) {
            var state = { status: 0 };
            if (this.props.cacheLocally) {
                this.debug("Checking storage for cached data");
                var localStorageData = checkStorage(props.firebaseRef, props.storage);
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
        BindToItem.prototype.buildOtherProps = function (outerProps) {
            var otherProps = {};
            for (var _i = 0, _a = lodash_1.difference(Object.keys(outerProps), BindToItem.propKeys); _i < _a.length; _i++) {
                var id = _a[_i];
                otherProps[id] = outerProps[id];
            }
            return otherProps;
        };
        BindToItem.prototype.buildInnerProps = function (outerProps) {
            var innerProps = this.buildOtherProps(outerProps);
            innerProps.data = this.state.data;
            return innerProps;
        };
        BindToItem.prototype.updateData = function (snapshot) {
            var val = snapshot.val();
            this.setState({ data: val, status: 2 });
            if (this.props.cacheLocally) {
                saveToStorage(this.props.firebaseRef, val, this.props.storage);
            }
        };
        BindToItem.prototype.debug = function (message) {
            if (this.props.debug) {
                console.log("bindToItem[" + this.props.firebaseRef + "]: " + message);
            }
        };
        BindToItem.propKeys = ["debug", "firebaseRef", "cacheLocally", "storage", "loader"];
        return BindToItem;
    }(React.Component));
    ;
    return BindToItem;
}
exports.bindToItem = bindToItem;
function localStorageKey(firebaseRef) {
    return "firebase-cache-item:" + firebaseRef;
}
function saveToStorage(firebaseRef, data, customStorage) {
    var storage = customStorage || window.localStorage;
    try {
        storage.setItem(localStorageKey(firebaseRef), JSON.stringify(data));
    }
    catch (err) {
        console.error(err.message);
    }
}
function checkStorage(firebaseRef, customStorage) {
    var storage = customStorage || window.localStorage;
    var item = storage.getItem(localStorageKey(firebaseRef));
    if (item) {
        return JSON.parse(item);
    }
}
//# sourceMappingURL=bind-to-item.js.map