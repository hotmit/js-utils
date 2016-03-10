/*global */

// STANDALONE: pure js

(function (global) {
    "use strict";

    var __JU, i, j, gVar, parts, curPart, curObj;

    // gettext place holder
    if (global.gettext === undefined){
        global.gettext = function(s){
            if (s == undefined){
                return '';
            }
            return s;
        };
    }

    function _removeFromVersionQueue (versionString){
        var index = global.JU._versionQueue.indexOf(versionString)
        if (index > -1){
            global.JU._versionQueue.splice(index, 1);
        }
    }


    /**
     * Initialize Super Global Variable (Contains the repo of all JU versions)
     * @type {{_repo: Array, _versionQueue: Array, _autoPublish: boolean, activate: function, deactivate: function, publish: function, get: function, remove: function}}
     */
    global.JU = global.JU || {
            /**
             * The repository of all the version of JU currently available.
             */
            '_repo': [],

            /**
             * The order or published JU version (this is use to revert back to older versions)
             */
            '_versionQueue': [],

            /**
             * Weather to put the library to the global object (ie. window.Str for example)
             */
            '_autoPublish': true,

            /**
             * Take the JU in the repo and put it in the specified target.
             *
             * @param target {!object} - where you want the lib functions to reside (commonly you want the window object to be the target)
             * @param versionString {?string=} - the version number you want to activate
             * @return {boolean}
             */
            activate: function(target, versionString)
            {
                var i, gVar, ju = global.JU.get(versionString);

                if (!ju || !target){
                    return false;
                }

                _removeFromVersionQueue(versionString);
                global.JU._versionQueue.push(ju.version);

                for(i=0; i<ju._globalVars.length; i++){
                    gVar = ju._globalVars[i];
                    if (gVar && gVar.indexOf('.') == -1 && ju.hasOwnProperty(gVar))
                    {
                        target[gVar] = ju[gVar];
                    }
                }

                return true;
            },

            /**
             * Remove the lib functions from the target.
             *
             * @param target {!object=} - if not specify global.JU is use instead
             * @param versionString {?string=} - if not specify the latest version will be use.
             * @returns {boolean}
             */
            deactivate: function(target, versionString){
                if (!target){
                    return false;
                }

                var ju = global.JU.get(versionString), i, gVar;
                for(i=0; i<ju._globalVars.length; i++){
                    gVar = ju._globalVars[i];
                    if (gVar && gVar.indexOf('.') == -1 && target.hasOwnProperty(gVar)
                        && target[gVar].version == versionString)
                    {
                        delete target[gVar];
                    }
                }

                return true;
            },

            /**
             * Add the JU instance into the main repo.
             *
             * @param ju {!object}
             * @param populateGlobals {?boolean=} - put all the library into the global scope (ie __JU.Str into window.Str)
             * @param forcePush {?boolean=} - replace existing version in the repo
             */
            publish: function(ju, populateGlobals, forcePush){
                var version = ju.version, _repo = global.JU._repo;

                if (global.JU.get(version) && forcePush){
                    global.JU.remove(version);
                }

                if (!global.JU.get(version)){
                    _repo.push(ju);

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
                    global.JU.activate(global, version);
                }
            },

            /**
             * Get JU by version number.
             *
             * @param versionString {?string=} - if not specified then get the latest version.
             * @returns {object|null}
             */
            get: function(versionString)
            {
                var i, _repo = global.JU._repo;
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

            /**
             * Remove the JU from the repo.
             *
             * @param versionString {?string=} - the version to remove, undefined to remove latest.
             * @returns {object}
             */
            remove: function(versionString){
                var i, _repo = global.JU._repo, ju;
                if (!_repo) {
                    return null;
                }

                if (!versionString){
                    ju = global.JU.get();
                    if (!ju){
                        return null;
                    }
                    versionString = ju.version;
                }

                for (i = 0; i < _repo.length; i++) {
                    if (_repo[i].version == versionString) {
                        _removeFromVersionQueue(versionString);
                        return _repo.splice(i, 1);
                    }
                }
                return null;
            }
        }; // END: New JU Object

    /**
     * The instance for constructing the library in the current version
     * @type {{_globalVars: string[], version: string, type: string}}
     */
    __JU = {
        '_globalVars': ['Typ', 'Arr', 'Fn', 'Str', 'Dt', 'Slct', 'Pref', 'Stl', 'UI', 'UI.Bs', 'UI.Patterns', 'Utl'],

        // This value must be string comparable, ie leave the padded zeros alone :)
        version: 'v1.00.0',
        type: 'JsUtils'
    };

    //region [ Initialize Lib Structure ]
    for (i = 0; i < __JU._globalVars.length; i++) {
        gVar = __JU._globalVars[i];

        if (gVar) {
            if (gVar.indexOf('.') == -1) {
                __JU[gVar] = {
                    'version': __JU.version,
                    'class': gVar
                }
            }
            else {
                curObj = __JU;
                parts = gVar.split('.');
                for (j = 0; j < parts.length; j++) {
                    curPart = parts[j];
                    curObj[curPart] = {
                        'version': __JU.version,
                        'class': curPart
                    };
                    curObj = curObj[curPart];
                }
            }
        }
    }
    //endregion

    /**
     * The instance for constructing the library in the current version
     * @type {{_globalVars: string[], version: string, type: string}}
     */
    global.JU.__JU = __JU;

}(typeof window !== 'undefined' ? window : this));