/*global jQuery */

// STANDALONE

(function (global, $) {
    "use strict";

    // gettext place holder
    if (global.gettext === undefined){
        global.gettext = function(s){
            if (s == undefined){
                return '';
            }
            return s;
        };
    }

    var JU;

    global.JU = JU = {
        '_globalVars': ['Typ', 'Arr', 'Fn', 'Str', 'Dt', 'Slct', 'Pref', 'Stl', 'UI', 'UI.Bs', 'UI.Patterns',
            '', '', '', '', '', '', '', '', '', ''],

        // This value must be string comparable, ie leave the padded zeros alone :)
        version: 'v1.00.0',
        type: 'JsUtils'
    };

    // Initialize Super Global Variable (Contains the repo of all JU versions)
    global._JU = global._JU || {
        '_repo': [],
        '_versionQueue': [],

        /**
         * Check if the object is an Array type
         *
         * @param obj {object}
         * @returns {boolean}
         */
        isArray: function(obj){
            return Object.prototype.toString.call(obj) === '[object Array]';
        },

        /**
         * Test for positive number (ie number >= 0)
         * @param num
         * @returns {boolean}
         */
        isPositiveNumber: function(num){
            if (typeof num == 'number' || typeof num == 'string'){
                var number = Number(num);
                return isNaN(number) ? false : number >= 0;
            }
            return false;
        },

        /**
         * Retrieve the value from the object using the attribute (dot notation is supported)
         *
         * @param obj {object} - any object
         * @param attr {string} - the attribute to retrieve (eg. contact.addresses.0.city)
         * @param defaultValue {object} - return this value on error or attribute not found.
         * @returns {*}
         */
        getAttr: function(obj, attr, defaultValue){
            var attrParts, i, newObj, curAttr;

            if (obj && attr != undefined && attr.length > 0){
                if (attr.indexOf('.') == -1){
                    if (obj.hasOwnProperty(attr)){
                        return obj[attr];
                    }
                    return defaultValue;
                }
                else {
                    attrParts = attr.split('.');
                    newObj = obj;
                    for (i=0; i<attrParts.length; i++)
                    {
                        curAttr = attrParts[i];

                        if (newObj.hasOwnProperty(curAttr)){
                            newObj = newObj[curAttr];

                            if (i == attrParts.length - 1){
                                return newObj;
                            }
                        }
                        else {
                            return defaultValue;
                        }
                    }
                }
            }
            return defaultValue;
        },

        /**
         * Assign value to an attribute of the specified object.
         *
         * @param obj {object} - any object
         * @param attr {string} - the attribute to retrieve (eg. contact.addresses.0.city)
         * @param value {object} - the value to assign
         * @param skipIfExist {bool} - if true, don't override existing value.
         * @return {bool} - true if value has been assigned
         */
        setAttr: function(obj, attr, value, skipIfExist){
            var attrParts, i, newObj, arrIndex, curAttr;

            if (obj && attr != undefined && attr.length > 0){
                if (attr.indexOf('.') == -1){
                    if (!skipIfExist || !obj.hasOwnProperty(attr)){
                        if (global._JU.isArray(obj))
                        {
                            if (global._JU.isPositiveNumber(attr)){
                                arrIndex = Number(attr);
                                if (arrIndex >= obj.length && arrIndex > 0)
                                {
                                    for(i=obj.length; i<arrIndex; i++){
                                        obj.push(null);
                                    }
                                    obj.push(value);
                                    return true;
                                }
                                obj.splice(arrIndex, 1, value);
                                return true;
                            }
                        }
                        else {
                            obj[attr] = value;
                            return true;
                        }
                    }
                }
                else {
                    attrParts = attr.split('.');
                    newObj = obj;
                    for (i=0; i<attrParts.length; i++)
                    {
                        curAttr = attrParts[i];
                        if (i < attrParts.length - 1){
                            global._JU.setAttr(newObj, curAttr, {}, true);
                        }
                        else {
                            return global._JU.setAttr(newObj, curAttr, value, skipIfExist);
                        }
                        newObj =  global._JU.getAttr(newObj, curAttr);
                    }
                }
            }
            return false;
        },

        /**
         * Take the functions from JU and put it in the global variables scope.
         *
         * @param gs {JU}
         */
        populateGlobals: function(gs)
        {

        },

        /**
         * Put the JU instance into the global repo.
         *
         * @param gs {JU}
         * @param populateGlobals {?bool=} - put all the library into the global scope (ie JU.Str into window.Str)
         * @param forcePush {?bool=} - replace existing version in the repo
         */
        publish: function(gs, populateGlobals, forcePush){
            var ver = gs.version, _repo = global._JU._repo;

            if (!global._JU.getJu(ver)){
                _repo.push(gs);

                // region [ Sort By Version ]
                _repo.sort(function(a, b){
                    if (''.localeCompare){
                        return a.toString().localeCompare(b.toString());
                    }

                    if (a.toString() < b.toString()) {
                        return -1;
                    }
                    if (a.toString() > b.toString()) {
                        return 1;
                    }
                    return 0;
                });
                // endregion
            }

            if (populateGlobals){
                global._JU.populateGlobals(gs);
            }
        },

        /**
         * Get JU by version number.
         *
         * @param versionString {?string=} - if not specified then get the latest version.
         * @returns {JU|null}
         */
        getJu: function(versionString)
        {
            var i, _repo = global._JU._repo;
            if (!_repo) {
                return null;
            }

            if (!versionString) {
                return _repo[_repo.length - 1];
            }

            for (i = 0; i < _repo.length; i++) {
                if (_repo[i].version == versionString) {
                    return _repo[i];
                }
            }
            return null;
        },

        removeJu: function(versionString, removeFromVersionQueue){
            var i, _repo = global._JU._repo, index;
            if (!_repo) {
                return null;
            }
            for (i = 0; i < _repo.length; i++) {
                if (_repo[i].version == versionString) {
                    index = global._JU._versionQueue.indexOf(versionString)
                    if (index > -1){
                        global._JU._versionQueue.splice(index, 1);
                    }

                    return _repo.splice(i, 1);
                }
            }
            return null;
        }

    }; // END: _JU

}(typeof window !== 'undefined' ? window : this, jQuery));