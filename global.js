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

    // Initialize Super Global Variable (Contains the repo of all __JU versions)
    global.JU = global.JU || {
        '_repo': [],
        '_versionQueue': [],
        '_autoPublish': false,

        /**
         * Take the functions from __JU and put it in the global variables scope.
         *
         * @param versionString {string} - the version number you want to activate
         * @param target {object} - where you want the lib functions to reside (commonly you want the window object to be the target)
         * @return {bool}
         */
        activate: function(versionString, target)
        {
            var i, gVar, ju = global.JU.get(versionString);

            if (!ju){
                return false;
            }

            _removeFromVersionQueue(versionString);
            global.JU._versionQueue.push(ju.version);

            for(i=0; i<ju._globalVars.length; i++){
                gVar = ju._globalVars[i];
                if (gVar && gVar.indexOf('.') == -1 && ju.hasOwnProperty(gVar))
                {
                    global.JU[gVar] = ju[gVar];
                    if (target){
                        target[gVar] = ju[gVar];
                    }
                }
            }

            return true;
        },

        /**
         * Put the __JU instance into the global repo.
         *
         * @param ju {__JU}
         * @param populateGlobals {?bool=} - put all the library into the global scope (ie __JU.Str into window.Str)
         * @param forcePush {?bool=} - replace existing version in the repo
         */
        publish: function(ju, populateGlobals, forcePush){
            var version = ju.version, _repo = global.JU._repo;

            if (global.JU.get(version) && forcePush){
                global.JU.remove(version, true);
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
                global.JU.activate(version, global);
            }
            else {
                global.JU.activate(version);
            }
        },

        /**
         * Get __JU by version number.
         *
         * @param versionString {?string=} - if not specified then get the latest version.
         * @returns {__JU|null}
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

        remove: function(versionString){
            var i, _repo = global.JU._repo;
            if (!_repo) {
                return null;
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

    // instance for constructing the library in the current version
    __JU = {
        '_globalVars': ['Typ', 'Arr', 'Fn', 'Str', 'Dt', 'Slct', 'Pref', 'Stl', 'UI', 'UI.Bs', 'UI.Patterns',
            'Utl', '', '', '', '', '', '', '', '', ''],

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

    global.JU.__JU = __JU;

}(typeof window !== 'undefined' ? window : this));