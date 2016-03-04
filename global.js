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

    var globalLibs = ['Typ', 'Arr', 'Fn', 'Str', 'Dt', 'Slct', 'Pref', 'Stl', 'UI', 'UI.Bs', 'UI.Patterns',
        '', '', '', '', '', '', '', '', '', ''], i,
        _GS, GS;

    global._GS = _GS = global._GS || {
        '_repo': [],

        publish: function(gs){
            var ver = gs.version;

            if (_GS.getGs(gs.ver)){

            }
        },

        getGs: function(versionString)
        {
            var i, _repo = _GS._repo;

            if (!_repo)
            {
                return null;
            }

            if (!versionString){
                return _repo[_repo.length-1];
            }

            for (i=0; i<_repo.length; i++){
                if (_repo[i].version == versionString){
                    return _repo[i];
                }
            }

            return null;
        }
    };

    GS = {
        version: 'v1.00.0'
    };

    if (global.GS){
        if (global.GS.version && global.GS.version > GS.version){
            GS = global.GS
        }
    }

    GS.getAttr = function(obj, attr, defaultValue){

    };

    GS.setAttr = function(obj, attr, value){
        var attrParts, i, newObj;

        if (obj && attr.length){
            if (attr.indexOf('.') == -1){
                if (!obj.hasOwnProperty(attr)){
                    obj[attr] = value;
                }
            }
            else {
                attrParts = attr.split('.');
                newObj = obj;
                for (i=0; i<attrParts.length; i++){
                    if (i < attrParts.length - 1){
                        GS.setAttr(newObj, attrParts[i], {});
                    }
                    else {
                        GS.setAttr(newObj, attrParts[i], value);
                    }

                    newObj = newObj[attrParts[i]];
                }
            }

        }
    };

    GS.init = function(){
        for(i=0; i<globalLibs.length; i++){
            GS.setAttr(GS, globalLibs[i], {});
        }
    };





}(typeof window !== 'undefined' ? window : this, jQuery));