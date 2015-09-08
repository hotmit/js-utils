/*global jQuery */


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


    // type.js
    if (global.Typ === undefined)
    {
        global.Typ = {};
    }

    // arr.js
    if (global.Arr == undefined) {
        global.Arr = {};
    }

    // func.js
    if (global.Fn === undefined)
    {
        global.Fn = {};
    }



    // str-standalone.js
    if (global.Str === undefined)
    {
        global.Str = {};
    }

    // bootstrap-ext.js
    if (global.UI === undefined)
    {
        global.UI = {
            Bs: {}
        };
    }
    else if (global.UI.Bs === undefined)
    {
        global.UI.Bs = {};
    }

    // date.js
    if (global.Dt === undefined)
    {
        global.Dt = {};
    }

    // slct.js
    if (global.Slct === undefined) {
        global.Slct = {};
    }

    // cookie.pref.js
    if (global.Pref === undefined)
    {
        global.Pref = {};
    }

    // style.js
    if (global.Stl === undefined)
    {
        global.Stl = {};
    }

    // tmr.js
    if (global.Tmr === undefined)
	{
		global.Tmr = {};
	}

    // ui.js
    if (global.UI === undefined)
    {
        global.UI = {};
    }

    // ui-patterns.js
    if (global.UI.Patterns === undefined)
    {
        global.UI.Patterns = {};
    }

}(typeof window !== 'undefined' ? window : this, jQuery));