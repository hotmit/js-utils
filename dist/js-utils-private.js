/*!
 * js-utils v1.2.5
 * https://github.com/hotmit/js-utils
 *
 * Copyright Du Dang
 * Released under the MIT license
 * https://github.com/hotmit/js-utils/LICENSE
 *
 * Date: 2019-04-17T14:14:36.812Z
 */

// STANDALONE: pure js

(function (global) {
    "use strict";

    var __JU, i, j, gVar, parts, curPart, curObj, _autoPopulateGlobal = true,

        // This value must be string comparable, ie. leave the padded zeros alone :)
        VERSION = 'v1.01.0',
        TYPE = 'JsUtils';

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
        var index = global.JU._versionQueue.indexOf(versionString);
        if (index > -1){
            global.JU._versionQueue.splice(index, 1);
        }
    }

    // If this is the very first JU, the global variable "JU_autoPopulateGlobal" can be use to disable auto populate.
    // Any other case, use global.JU._autoPopulateGlobal to disable instead.
    if (!global.JU && global.hasOwnProperty('JU_autoPopulateGlobal'))
    {
        _autoPopulateGlobal = !!global['JU_autoPopulateGlobal'];
    }


    /**
     * Initialize Super Global Variable (Contains the repo of all JU versions)
     * @type {{_repo: Array, _versionQueue: Array, _autoPopulateGlobal: boolean, activate: function, deactivate: function, publish: function, get: function, remove: function, revert: function }}
     */
    global.JU = global.JU || {
            /**
             * The repository of all the version of JU currently available.
             */
            '_repo': [],

            /**
             * The order of activated JU version (this is use to revert back to older versions)
             */
            '_versionQueue': [],

            /**
             * Weather to put the library to the global object (ie. window.Str for example)
             */
            '_autoPopulateGlobal': _autoPopulateGlobal,

            /**
             * Global JU version.
             */
            '_version': VERSION,

            /**
             * Take the JU in the repo and put it in the specified target.
             *
             * @param target {!object} - where you want the lib functions to reside (commonly you want the window object to be the target)
             * @param versionString {?string=} - the version number you want to activate
             * @return {boolean}
             */
            activate: function(target, versionString)
            {
                var i, gVar, ju = global.JU.get(versionString), property;

                if (!ju || !target){
                    return false;
                }

                _removeFromVersionQueue(versionString);
                global.JU._versionQueue.push(ju.version);

				for (property in ju) {
					if (ju.hasOwnProperty(property)) {
						target[property] = ju[property];
					}
				}
				
                return true;
            },

            /**
             * Remove the lib functions from the target.
             *
             * @param target {!object} - the object to deactivate
             * @param versionString {?string=} - if not specify the latest version will be use.  Specify constant '*' to remove all version.
             * @returns {boolean}
             */
            deactivate: function(target, versionString){
                if (!target){
                    return false;
                }

                var removeAll = false, ju, i, gVar;
				
                if (versionString == '*'){
                    removeAll = true;
                    versionString = null;
                }

                ju = global.JU.get(versionString);
                if (!ju){
                    return false;
                }
				
                for(i=0; i<ju._globalVars.length; i++){
                    gVar = ju._globalVars[i];
                    if (gVar && gVar.indexOf('.') == -1 && target.hasOwnProperty(gVar)
                            && (target[gVar].hasOwnProperty('type') && target[gVar].type == TYPE)
                            && (removeAll || target[gVar].version == versionString))
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
                        global.JU.deactivate(global, versionString);
                        return _repo.splice(i, 1);
                    }
                }
                return null;
            },

            /**
             * Go back to older version in the queue, if it is the last version
             * then just remove without activate new one.
             *
             * @param populateGlobals {?boolean=} - put all the library into the global scope (ie __JU.Str into window.Str)
             * @returns {object|null} - return the removed version of JU
             */
            revert: function(populateGlobals){
                var _repo = global.JU._repo, queue = global.JU._versionQueue, version, ju;
                if (_repo.length > 0 && queue.length > 0) {
                    version = queue.pop();

                    while (queue.length) {
                        ju = global.JU.get(version);
                        if (!ju) {
                            version = queue.pop();
                            continue;
                        }

                        // remove the old version from the global object (if it exist)
                        global.JU.deactivate(global, version);

                        if (populateGlobals && queue.length){
                            version = queue[queue.length - 1];
                            global.JU.activate(global, version);
                        }

                        return ju;
                    }
                }
                return null;
            }
        }; // END: New JU Object


    /**
     * The instance for constructing the library in the current version
     * @type {{_globalVars: string[], version: string, type: string,
     *          Arr, Dt, Fn, Obj, Pref, Slct, Stl, Str, Tmr, Typ, UI: {Bs, Patterns}, Utl}}
     */
    __JU = {
        '_globalVars': ['Arr', 'Dt', 'Fn', 'Obj', 'Pref', 'Slct', 'Stl', 'Str', 'Tmr', 'Typ', 'UI', 'UI.Bs', 'UI.Patterns',
            'Utl'],

        'version': VERSION,
        'type': TYPE
    };

    //region [ Initialize Lib Structure ]
    for (i = 0; i < __JU._globalVars.length; i++) {
        gVar = __JU._globalVars[i];

        if (gVar) {
            if (gVar.indexOf('.') == -1) {
                __JU[gVar] = {
                    'version': VERSION,
                    'class': gVar,
                    'type': TYPE
                }
            }
            else {
                curObj = __JU;
                parts = gVar.split('.');
                for (j = 0; j < parts.length; j++) {
                    curPart = parts[j];
                    if (!curObj.hasOwnProperty(curPart)){
                        curObj[curPart] = {
                            'version': VERSION,
                            'class': curPart,
                            'type': TYPE
                        };
                    }
                    curObj = curObj[curPart];
                }
            }
        }
    }
    //endregion

    /**
     * The instance for constructing the library in the current version
     * @type {{_globalVars: string[], version: string, type: string,
     *          Arr, Dt, Fn, Obj, Pref, Slct, Stl, Str, Tmr, Typ, UI: {Bs, Patterns}, Utl}}
     */
    global.JU.__JU = __JU;

}(typeof window !== 'undefined' ? window : this));
/*global jQuery, JU.__JU, setTimeout */

// STANDALONE: pure js


(function (global, Tmr) {
    "use strict";

    /**
     * Just like setTimeout except it has the argument to override the this instance
     *
     * @param func {function} - "this" is the specified "thisArg"
     * @param delay {number} - in millisecond
     * @param thisArg {object=} - similar to $.proxy, supply "this" for func
     * @returns {number} - setTimeout instance, use clearTimeout
     */
    Tmr.run = function(func, delay, thisArg){
        return setTimeout(function(){ func.call(thisArg || this); }, delay);
    };

}(typeof window !== 'undefined' ? window : this, JU.__JU.Tmr));

/*global jQuery, JU.__JU */

// STANDALONE: pure js


/**
	// Source: http://www.php.net/manual/en/function.date.php

	// Day
	d	01 to 31
	D	Mon through Sun
	j	1-31
	l (lowercase 'L')	Sunday through Saturday
			N print number 1 (for Monday) through 7 (for Sunday) (Not implemented)
	N	Ngay bang Tieng Viet => Thu Hai - Chua Nhat (Dup, Non Standard)
	S  day of month st, nd, rd, th  (Not implemented)
			w print number 1 (for Monday) through 7 (for Sunday) (Not implemented)
			z day of year  (Not implemented)
			W week number in the year

	// Month
	F	January through December
	m	01 through 12
	M	Jan through Dec
	n	1 through 12
	T	Thang bang Tieng Viet => Thang Mot - Thang Muoi Hai (Non Standard)
		t total number of days in the month  28 through 31 (Not implemented)

	// Year
	Y	1999 or 2003
	y	99 or 03
			L 1 if it is a leap year, 0 otherwise. (Not implemented)

	// Time
	a	am or pm
	A	AM or PM
	g	1 through 12	hour/12
	G	0 through 23	hour/24
	h	01 through 12	pad hour/12
	H	00 through 23	pad hour/24
	i	00 to 59		pad minute
	s	00 to 59		pad second

	// Time Zone
	O	+0200 	<= utc + 2hours
	P	+02:00

	// Time
	c	2004-02-12 15:19:21+00:00	php=2004-02-12T15:19:21+00:00
	r	Thu, 21 Dec 2000 16:01:07 +0200
	q	2001-03-10 17:16:18	Y-m-d H:i:s	mysql date  (Non Standard)
	o	2004-02-12		Y-m-d  (Dup, Non Standard)
	t	5:34pm			g:ia  (Dup, Non Standard)
*/

(function (global, $, Dt) {
    "use strict";


    var _dayShort 	= ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        _dayLong 	= ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        _dayViet 	= ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chúa Nhật'],
        _monthShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        _monthLong 	= ['January', 'February', 'March', 'April', 'May', 'June',
                     'July', 'August', 'September', 'October', 'November', 'December'];

    /**
     * Get a array of all the parts of a date. (N for viet day)
     *
     * @param d {Date}- the date object.
     * @returns {object}
     */
    Dt.getDateParts = function(d){
        var o = {}, j = d.getDate(),
            w = d.getDay(), GG = d.getHours(),
            n = d.getMonth(), Y = d.getFullYear(),

            // 12 hour format
            g = GG <= 12 ? GG : GG - 12,
            tz = d.getTimezoneOffset() / 60,
            tzSign = tz < 0 ? '-' : '+';

        g = g == 0 ? 12 : g;

        // timezone
        tz = Math.abs(tz);

        o.d = Dt.padZero(j);
        o.D = _dayShort[w];
        o.j = j;
        o.l = _dayLong[w];
        o.N = _dayViet[w];

        o.F = _monthLong[n];
        o.m = Dt.padZero(n+1);
        o.M = _monthShort[n];
        o.n = n+1;
        o.T = 'Tháng ' + (n+1);

        o.Y = Y;
        o.y = Y.toString().substring(2);

        o.a = GG < 12 ? 'am' : 'pm';
        o.A = GG < 12 ? 'AM' : 'PM';
        o.g = g;
        o.G = GG;
        o.h = Dt.padZero(g);
        o.H = Dt.padZero(GG);
        o.i = Dt.padZero(d.getMinutes());
        o.s = Dt.padZero(d.getSeconds());

        o.O = tzSign + Dt.padZero(tz) + '00';
        o.P = tzSign + Dt.padZero(tz) + ':00';

        o.c = o.Y+'-'+o.m+'-'+o.d+' '+o.H+':'+o.i+':'+o.s+o.P;
        o.r = o.D+', '+o.j+' '+o.M+' '+o.Y+' '+o.H+':'+o.i+':'+o.s+' '+o.O;
        o.q = o.Y+'-'+o.m+'-'+o.d+' '+o.H+':'+o.i+':'+o.s;
        o.o = o.Y+'-'+o.m+'-'+o.d;
        o.t = o.g+':'+o.i+o.a;

        return o;
    };

    /**
     * Get the utc equivalent of getDateParts().
     *
     * @param d {Date} - the local date time.
     */
    Dt.getUtcParts = function(d){
        var utc = Dt.toUtc(d),
            o = Dt.getDateParts(utc);

        o.O = '+0000';
        o.P = '+00:00';
        o.c = o.c.substring(0, 19) + o.O;
        o.r = o.r.substring(0, 26) + o.P;

        return o;
    };

    /**
     * Convert to utc, but the getTimezoneOffset() is not zero, but the date and time is utc.
     *
     * @param d {Date} - local date object
     */
    Dt.toUtc = function(d)
    {
        // convert minute into ms
        var offset = d.getTimezoneOffset() * 60000;
        return new Date(d.getTime() + offset);
    };

    /**
     * Two dates has the same year, month and day.
     * @param d1 {Date}- date object
     * @param d2 {Date}- date object
     * @returns {boolean}
     */
    Dt.isSameDate = function(d1, d2)
    {
        return  d1.getFullYear() == d2.getFullYear()
                && d1.getMonth() == d2.getMonth()
                &&  d1.getDate() == d2.getDate();
    };
    /**
     * Two dates has the same year, month and day.
     * @param e1 {number} - milliseconds since 1970 (unix epoch). Note php time() is in seconds not milliseconds.
     * @param e2 {number} - milliseconds since 1970 (unix epoch). Note php time() is in seconds not milliseconds.
     * @returns {boolean}
     */
    Dt.epochSameDate = function(e1, e2){
        var d1 = new Date(e1),
            d2 = new Date(e2);

        return Dt.isSameDate(d1, d2);
    };

    /**
     * Add a zero to the front if it is a single digit.
     * @param s {number|string} - the number or string.
     * @returns {String}
     */
    Dt.padZero = function(s){
        s = s.toString();
        return s.length == 2 ? s : '0' + s;
    };

    /**
     * Is Date data type
     * @param o {object} - the object to test.
     * @returns {boolean}
     */
    Dt.isDate = function(o){
        return Object.prototype.toString.call(o) === "[object Date]";
    };

    /**
     * Test to see if the date is valid. Usually it bad date
     * when the string use to create the date object is bad (ie not valid date format).
     * Example: new Date("hello world");
     *
     * @param d {Date} - the date object
     * @returns {boolean}
     */
    Dt.isValid = function(d){
        if (Dt.isDate(d)){
            // d = new Date("junk") => d.getTime() return NaN
            return !isNaN(d.getTime());
        }
        return false;
    };

    /**
     * Format date according to the format string.
     * @param d {Date} - date
     * @param format {string} - format string, for format look up php date() (this function doesn't support all format)
     * MAKE SURE to double escape the backslash ie if you want to escape a letter 'h' => '\\h'
     * @return {string}
     */
    Dt.format = function(d, format){
        if (!Dt.isValid(d)){
            return format;
        }

        var p = Dt.getDateParts(d),
            result = format.replace(/(\\?)([dDjlNFmMnTYyaAgGhHisOPcrqot])/g, function (whole, slash, key){
                        // no slash
                        if (!slash){
                            return p[key];
                        }

                        // if slash exist ie this is an escaped char
                        // return just the letter as a literal
                        return key;
                    });

        // remove any unnecessary backslashes
        result = result.replace(/\\([a-z])/gi, '$1');

        return result;
    };

}(typeof window !== 'undefined' ? window : this, jQuery, JU.__JU.Dt));


/*global jQuery, JU.__JU */

// STANDALONE: jq

(function (global, $, Obj) {
    "use strict";

    /**
     * Remove a property from the object and return the removed object.
     *
     * @param obj - the object in question
     * @param prop - the prop name
     * @param defaultValue - return this value if prop doesn't exist
     * @returns {*}
     */
    Obj.pop = function(obj, prop, defaultValue){
        if (!obj.hasOwnProperty(prop)){
            return defaultValue
        }

        var result = obj[prop];
        delete obj[prop];
        return result;
    };

    /**
     * Determine if object has the specified property.
     *
     * @param obj
     * @param prop
     * @returns {boolean}
     */
    Obj.hasProp = function(obj, prop){
        return obj.hasOwnProperty(prop);
    }

}(typeof window !== 'undefined' ? window : this, jQuery, JU.__JU.Obj));
/*global jQuery, JU.__JU, Node, HTMLElement */

// STANDALONE: jq


(function (global, $, Typ) {
    "use strict";

    /**
     * Is jQuery object
     * @param o
     * @returns {boolean}
     */
    Typ.isJquery = function(o){
        return o instanceof jQuery;
    };

    /**
     * Is js object
     * @param o
     * @returns {boolean}
     */
    Typ.isObj = function(o){
        return $.type(o) === 'object';
    };

    /**
     * Is string
     * @param o
     * @returns {boolean}
     */
    Typ.isStr = function(o){
        return $.type(o) === 'string';
    };

    /**
     * Is function
     * @param o
     * @returns {boolean}
     */
    Typ.isFunc = function(o){
        return $.type(o) === 'function';
    };

    /**
     * Is regex
     * @param o
     * @returns {boolean}
     */
    Typ.isRegex = function(o){
        return $.type(o) === 'regexp';
    };

    /**
     * Is number
     * @param o
     * @returns {boolean}
     */
    Typ.isNumber = function(o){
        return $.type(o) === 'number';
    };

    /**
     * Is integer
     * @param o
     * @returns {boolean}
     */
    Typ.isInt = function(o){
        return Typ.isNumber(o) && o%1 === 0;
    };

    /**
     * Is float
     * @param o
     * @returns {boolean}
     */
    Typ.isFloat = function(o){
        return Typ.isNumber(o) && !Typ.isInt(o);
    };

    /**
     * Is date
     * @param o
     * @returns {boolean}
     */
    Typ.isDate = function(o){
        return $.type(o) === 'date';
    };

    /**
     * Is boolean
     * @param o
     * @returns {boolean}
     */
    Typ.isBool = function(o){
        return $.type(o) === 'boolean';
    };

    /**
     * Is array
     * @param o
     * @returns {boolean}
     */
    Typ.isArray = function(o){
        return $.type(o) == 'array';
    };

    /**
     * Is node
     * @param o
     * @returns {boolean}
     */
    Typ.isNode = function(o){
        return typeof Node === "object" ? o instanceof Node :
            o && typeof o === "object" && typeof o.nodeType === "number" && typeof o.nodeName === "string";
    };

    /**
     * Is html element
     * @param o
     * @returns {boolean}
     */
    Typ.isElement = function(o){
        return typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
            o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName==="string";
    };

    /**
     * Check see if the object is the ajax command object.
     *
     * @param o
     * @returns {boolean}
     */
    Typ.isAjaxCommand = function(o){
        return !!(o != undefined && o != false && !Typ.isStr(o)
                    && o.isAjaxCommand && o.options != undefined
                    && o.displayMethod != undefined && o.command != undefined);
    };

}(typeof window !== 'undefined' ? window : this, jQuery, JU.__JU.Typ));



/*global jQuery, JU.__JU, Str */

// REQ: jq, str

(function (global, $, Arr, Str) {
    "use strict";

    /**
     * Is array
     *
     * @param o {object}
     * @returns {boolean}
     */
    Arr.isArray = function(o){
        if (Array.isArray){
            return Array.isArray(o);
        }
        return $.type(o) == 'array';
    };

    /**
     * Useful when run for IN loop, to determine the key is the property
     * of that and not something inherited.
     *
     * @param arr {Array} - the array
     * @param prop {string} - property name/index/key
     * @return {boolean}
     */
    Arr.isProp = function(arr, prop){
        return arr.hasOwnProperty(prop);
    };

    /**
     * Loop through the array and check for the hasOwnProperty() as well.
     *
     * @param arr {Array} - the array
     * @param func {function(this:Array, item, asc_key:string, index:number):boolean}
     * 		- "this" refer to the arr, return false to break the loop
     */
    Arr.each = function(arr, func){
        var i=0, k, r;
        for(k in arr){
            if (arr.hasOwnProperty(k)){
                r = func.call(arr, arr[k], k, i);

                if (r === false){
                    break;
                }
                i++;
            }
        }
    };

    /**
     * Loop through the list of jQuery objects.
     *
     * @param jqObj {jQuery} - the jQuery list
     * @param func {function(this:jQuery, jqElm:jQuery, domElm:HTMLElement, index:number):boolean}
     * 		- "this" refer to the jqObj collection, return false to break the loop
     */
    Arr.eachJq = function(jqObj, func){
        var i, r, len;
        if (jqObj == undefined || !(jqObj instanceof jQuery)){
            return null;
        }

        for(i=0, len=jqObj.length; i<len; i++){
            r = func.call(jqObj, jqObj.eq(i), jqObj.get(i), i);

            if (r === false){
                break;
            }
        }
    };

    /**
     * Create an array out of a range of number.
     * eg. range(10) 	=> [0,2 .. 8, 9] len==10
     *     range(1,3) 	=> [1,2]
     *     range(1,7,2)	=> [1,3,5]
     *
     * @param start {!number}
     * @param end {?number=} - non-inclusive
     * @param step {?number=}
     * @return {Array}
     */
    Arr.range = function (start, end, step) {
        if (end == undefined){
            end = start;
            start = 0;
        }

        if (step == undefined){
            step = 1;
        }

        var arr = [], val=start;
        while(val<end){
            arr.push(val);
            val+= step;
        }

        return arr;
    };

    /**
     * Join the array together to make a string.
     *
     * @param arr {!Array<string>}
     * @param glue {string=}
     */
    Arr.implode = function(arr, glue){
        glue = glue == undefined ? ', ' : glue;
        return arr.join(glue);
    };

    /**
     * Split the array into multiple smaller arrays with the specified trunk size length (modify arr).
     *  eg. [1,2,3,4,5] trunk size 2 => [[1,2], [3,4], [5]]
     *
     * @param arr {!Array} - this array will be emptied at the end.
     * @param chunkSize {number}
     * @returns {Array<Array>}
     */
    Arr.chop = function(arr, chunkSize){
        var result = [], chunk;
        while(arr.length){
            chunk = arr.splice(0, chunkSize);
            result.push(chunk);
        }
        return result;
    };

    /**
     * Split arr into chunks (leave arr intact)
     *
     * @param arr {!Array}
     * @param chunkSize {number}
     * @returns {Array}
     */
    Arr.chunks = function (arr, chunkSize) {
        var result = [];
        for (var i=0, len=arr.length; i<len; i+=chunkSize){
            result.push(arr.slice(i, i+chunkSize));
        }
        return result;
    };

    /**
     * Remove any emptied items in the array
     *
     * @param arr {Array} - the array to trimf
     * @param callback {?function} - optional test function(element), return true to keep the item.
     * @returns {Array}
     */
    Arr.trim = function(arr, callback){
        var i, result = [];
        if (!arr){
            return result;
        }
        callback = callback || function(elm){
                return !Str.empty(elm);
            };
        for(i=0; i<arr.length; i++){
            var itm = arr[i];
            if (callback.call(itm, itm)){
                result.push(itm);
            }
        }
        return result;
    };
}(typeof window !== 'undefined' ? window : this, jQuery, JU.__JU.Arr, JU.__JU.Str));
/*global jQuery, JU.__JU, Utl, Typ  */

// REQ: jq, utils, type


(function (global, $, Fn, Utl, Typ) {
    "use strict";

    /**
     * Similar to function.call but it checks for undefined function
     *
     * @param func {?function} - the function
     * @param thisArg {object}
     * @param argArray {..object=} - the arguments objects
     * @returns {*}
     */
    Fn.call = function(func, thisArg, argArray){
        var args = [].slice.call(arguments).splice(2);
        return Fn.apply(func, thisArg, args);
    };

    /**
     * Similar to function.apply but it checks for undefined function
     *
     * @param func {?function}
     * @param thisArg {object}
     * @param argArray {?object|Array=}
     * @returns {*}
     */
    Fn.apply = function (func, thisArg, argArray){
        if (func != undefined && $.type(func) === 'function'){
            if (argArray == undefined){
                argArray = [];
            }
            else if ($.type(argArray) != 'array'){
                argArray = [argArray];
            }
            return func.apply(thisArg, argArray);
        }
    };

    /**
     * Execute a function by name (supports "Obj.sub.runMe")
     * @param funcName {?string} - name of the function (supports "Obj.sub.runMe")
     * @param context {?object} - pass "window" object to gain access to global object's functions
     * @param argArray {...object=}
     * @returns {*}
     */
    Fn.callByName = function(funcName, context, argArray){
        if (funcName == undefined || !funcName){
            return;
        }

        context = context || global;
        var args = [].slice.call(arguments).splice(2),
            namespaces = funcName.split("."),
            func = namespaces.pop(), i;

        for(i = 0; i < namespaces.length; i++){
            context = context[namespaces[i]];
            if (context == undefined){
                return;
            }
        }

        if (context[func] && $.isFunction(context[func])) {
            return context[func].apply(context, args);
        }
    };

    /**
     * Execute a function by name (supports "Obj.sub.runMe")
     *
     * @param funcName {?string} - name of the function (supports "Obj.sub.runMe")
     * @param context {?object} - pass "window" object to gain access to global object's functions
     * @param argArray {Array=} - the array of the args
     * @returns {*}
     */
    Fn.applyByName = function(funcName, context, argArray){
        if (funcName == undefined || !funcName){
            return;
        }

        context = context || global;
        var namespaces = funcName.split("."),
            func = namespaces.pop(), i;
        for(i = 0; i < namespaces.length; i++) {
            context = context[namespaces[i]];
            if (context == undefined){
                return;
            }
        }

        if (context[func] && $.isFunction(context[func])) {
            return context[func].apply(context, argArray);
        }
    };

    /**
     * Combine multiple functions together and run one after another,
     * all functions must have the same parameters.
     *
     * @param thisArg {object}
     * @param arrArray {Array=} - pass the arguments of the previous function
     * @param args {Array<function>}
     */
    Fn.chain = function(thisArg, arrArray, args){
        var f;
        args = Array.prototype.splice.call(arguments, 2);

        for (f in args) {
            if (args.hasOwnProperty(f)){
                if (f != undefined && $.type(f) === 'function') {
                    f.apply(thisArg, arrArray);
                }
            }
        }
    };

    /**
     /**
     * Attach your own function to existing functions.
     *  ie. good to latch your function to another function
     *
     * @param primaryFunc {function} - the main function, this function return will be the return on the final result
     * @param trailingFunc {function} - the latch function, the return value for this will be ignore
     * @param thisArgs {object} - the "this" object, the default is the reference to the primary function
     * @returns {function} - returns the combined function
     */
    Fn.combine = function(primaryFunc, trailingFunc, thisArgs){
        return function () {
            var args = Array.prototype.splice.call(arguments),
                primaryResult;

            if (primaryFunc){
                primaryResult = primaryFunc.apply(thisArgs || this, args)
            }
            trailingFunc.apply(thisArgs || this, args);
            return primaryResult;
        };
    };

    /**
     * Use this to hitch a list of functions to the end of another function,
     * but not certain if the main function exist.
     *  eg. global.factory.onLoad = Fn.combineWithContext(global, 'factory.onLoad', HideAfterLoad);
     *      once the "onLoad" function is execute it also execute the HideAfterLoad() function and return the result
     *      of the main onLoad function
     *
     * @param context {object} - the object the has the function
     * @param funcAttr {function} - the attribute name to retrieve the primary function
     * @param thisArg {object} - the "this" value
     * @param args - {function} - *args, list of all the functions you want to attach to the primary function
     * @returns {function}
     */
    Fn.combineWithContext = function(context, funcAttr, thisArg, args){
        var funcList = Array.prototype.splice.call(arguments, 3), primaryFunc = Utl.getAttr(context, funcAttr);

        // put the primary function in the front of the func list
        funcList.splice(0, 0, primaryFunc);

        // get the first non-null function in the array
        // eslint-disable-next-line no-empty
        while(!(funcList.length && (primaryFunc = funcList.shift()))){}

        if (!primaryFunc){
            // if nothing is specified then just return a dummy func
            return function(){};
        }

        return function(){
            var callArgs = Array.prototype.splice.call(arguments),
                result = primaryFunc.apply(thisArg || this, callArgs), secondaryFunc, i;

            for(i=0; i<funcList.length; i++){
                secondaryFunc = funcList[i];
                if (Typ.isFunc(secondaryFunc)){
                    secondaryFunc.apply(thisArg || this, callArgs);
                }
            }
            return result;
        }
    };

}(typeof window !== 'undefined' ? window : this, jQuery, JU.__JU.Fn, JU.__JU.Utl, JU.__JU.Typ));
/*global jQuery, JU.__JU */

// STANDALONE: jq


(function (global, $, Stl) {
	"use strict";

    /**
     * Add the style to the head (string -> css style text)
     * @param style {String|Array} - style text, http link or array of links
     */
    Stl.add = function(style){
        if ($.isArray(style))
        {
            $.each(style, function(i, elm){
                $('<link href="">').attr('href', elm).appendTo('head');
            });
        }
        else if ($.type(style) === 'string')
        {
            if (style.indexOf('http') == 0)
            {
                Stl.add([style]);
            }
            else
            {
                $('<style type="text/css">' + style + '</style>').appendTo('head');
            }
        }
    };

}(typeof window !== 'undefined' ? window : this, jQuery, JU.__JU.Stl));
/*global JU.__JU */

// STANDALONE: pure js

(function (global, Str) {
    "use strict";

    // region [ Private Functions ]
    /**
     * Test if the specified object is an array.
     * @param obj {Array|object}
     * @returns {boolean}
     * @private
     */
    function _isArray(obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
    }

    /**
     * Convert json string into js object.
     * @param s
     * @private
     */
    function _parseJson(s) {
        var _parser;
        if (typeof global.JSON !== 'undefined') {
            _parser = global.JSON.parse;
        }
        else if (typeof window.jQuery !== 'undefined') {
            _parser = window.jQuery.parseJSON;
        }

        if (typeof _parser === 'undefined') {
            throw 'Undefined JSON method';
        }
        return _parser(s);
    }

    // endregion

    /**
     * Check for undefined, null, zero length, blanks or s is false.
     * @param s {string|object} - string, array or object to test.
     * @returns {boolean}
     * Unit Test: http://jsfiddle.net/wao20/TGP3N/
     */
    Str.empty = function (s) {
        // s == undefined	 <= double equals is deliberate, check for null and undefined
        return !!(s == undefined
        || s.length === 0
        || Str.trim(s).length === 0
        || !s);

    };

    /**
     * Compare two strings
     * @param s1 {?string}
     * @param s2 {?string}
     * @param caseSensitive {boolean=}
     * @returns {boolean}
     */
    Str.equals = function (s1, s2, caseSensitive) {
        if (s1 == undefined || s2 == undefined) {
            return false;
        }

        if (caseSensitive) {
            return s1 == s2;
        }
        return s1.toLowerCase() == s2.toLowerCase();
    };

    /**
     * empty(), '0', '0.0', 'false' => false. Otherwise return !!s.
     *
     * @param s {?string}
     * @returns {boolean}
     */
    Str.boolVal = function (s) {
        if (Str.empty(s)) {
            return false;
        }
        s = Str.trim(s).toLowerCase();
        if (s == '0' || s == '0.0' || s == 'false') {
            return false;
        }
        return !!s;
    };

    /**
     * Escape the string to be use as a literal in regex expression.
     *
     * @param s {string|Array}
     * @returns {string|Array}
     */
    Str.regexEscape = function (s) {
        if (!s) {
            return '';
        }

        if (typeof s === 'string') {
            return s.replace(/([.?*+\^$\[\]\\(){}|\-])/g, '\\$1');
        }
        else if (_isArray(s)) {
            var result = [], i;
            for (i = 0; i < s.length; i++) {
                result.push(Str.regexEscape(s[i]));
            }
            return result;
        }
        return s;
    };

    /**
     * Tests whether the beginning of a string matches pattern.
     *
     * @param s {string}
     * @param pattern {string} - to find
     * @param caseSensitive {boolean=}
     * @return {boolean}
     */
    Str.startsWith = function (s, pattern, caseSensitive) {
        if (caseSensitive) {
            return s.indexOf(pattern) === 0;
        }
        return s.toLowerCase().indexOf(pattern.toLowerCase()) === 0;
    };

    /**
     * Test if string ends with specified pattern
     * @param s {string}
     * @param pattern {string}
     * @param caseSensitive {boolean=}
     * @returns {boolean}
     */
    Str.endsWith = function (s, pattern, caseSensitive) {
        var d = s.length - pattern.length;
        if (caseSensitive) {
            return d >= 0 && s.lastIndexOf(pattern) === d;
        }
        return d >= 0 && s.toLowerCase().lastIndexOf(pattern.toLowerCase()) === d;
    };

    /**
     * Check if the string contains a substring.
     * @param s {string}
     * @param needle {string}
     * @param caseSensitive {boolean=}
     * @return {boolean}
     */
    Str.contains = function (s, needle, caseSensitive) {
        if (Str.empty(s) || Str.empty(needle)) {
            return false;
        }
        if (caseSensitive) {
            return s.indexOf(needle) > -1;
        }
        return s.toLowerCase().indexOf(needle.toLowerCase()) > -1;
    };

    /**
     * Must contains all the element in the array.
     * @param s {string}
     * @param needles {Array|string}
     * @param caseSensitive {boolean=}
     * @return {boolean}
     */
    Str.containsAll = function (s, needles, caseSensitive) {
        var i = 0;
        if (_isArray(needles)) {
            for (i = 0; i < needles.length; i++) {
                if (!Str.contains(s, needles[i], caseSensitive)) {
                    return false;
                }
            }
            return true;
        }
        return Str.contains(s, needles, caseSensitive);
    };

    /**
     * Must contains ANY the element in the array.
     * @param s {string}
     * @param needles {Array|string}
     * @param caseSensitive {boolean=}
     * @return {boolean}
     */
    Str.containsAny = function (s, needles, caseSensitive) {
        var i;
        if (_isArray(needles)) {
            for (i = 0; i < needles.length; i++) {
                if (Str.contains(s, needles[i], caseSensitive)) {
                    return true;
                }
            }
            return false;
        }
        return Str.contains(s, needles, caseSensitive);
    };

    /**
     * Determine if the specified variable is a string
     * @param o
     * @returns {boolean}
     */
    Str.isString = function (o) {
        return typeof o === 'string';
    };

    /**
     * Trims white space from the beginning and end of a string.
     * @param s {string}
     * @param c {string=}
     * @return {string}
     */
    Str.trim = function (s, c) {
        if (!Str.isString(s)) {
            return s;
        }

        if (c == undefined || c == ' ') {
            if (String.prototype.trim) {
                return String.prototype.trim.call(s);
            }
            return s.replace(/^\s+/, '').replace(/\s+$/, '');
        }
        return Str.trimStart(Str.trimEnd(s, c), c);
    };

    /**
     * Remove chars/Str from the start of the string
     * @param s
     * @param c {string|Array=} - supports Str.trimStart(s, ['0x0', '0', 'x']);
     */
    Str.trimStart = function (s, c) {
        if (c == undefined || c == '') {
            return s.replace(/^\s+/, '');
        }

        var trims = c, regex, result;
        if (!_isArray(c)) {
            trims = [c];
        }
        trims = Str.regexEscape(trims).join('|');
        regex = '^(' + trims + '|\s)+';
        regex = new RegExp(regex, 'g');
        result = s.replace(regex, '');
        return result;
    };

    /**
     * Remove chars/Str(s) from the end of the string
     * @param s {string}
     * @param c {string|Array=} - supports Str.trimEnd(s, ['0x0', '0', 'x']);
     */
    Str.trimEnd = function (s, c) {
        if (c == undefined) {
            return s.replace(/\s+$/, '');
        }
        var trims = c, regex, result;
        if (!_isArray(c)) {
            trims = [c];
        }
        trims = Str.regexEscape(trims).join('|');
        regex = '(' + trims + '|\s)+$';
        regex = new RegExp(regex, 'g');
        result = s.replace(regex, '');
        return result;
    };

    /**
     * Extended substring, support negative index (ordinal js substr(startIndex, endIndex))
     *
     * @param s {string}
     * @param index {number} - if negative take string from the right similar to php substr()
     * @param len {number=} - number of char to take starting from the index to the right (even when index is negative)
     * @return {string}
     */
    Str.subStr = function (s, index, len) {
        if (s == undefined) {
            return '';
        }

        len = len || 0;

        if (Math.abs(index) > s.length) {
            return s;
        }

        // regular substring
        if (index > -1) {
            if (len > 0 && (index + len) < s.length) {
                return s.substring(index, index + len);
            }
            return s.substring(index);
        }

        // Negative index, take string from the right
        // Index is negative	=> subStr ('hello', -3)	=> 'llo'
        var start = s.length + index;
        if (len > 0 && (start + len) < s.length) {
            return s.substring(start, start + len);
        }
        return s.substring(start);
    };

    /**
     * Count number of occurrences of an substring.
     * @param s {string} - the big string
     * @param sub {string} - the little string you want to find.
     * @param caseSensitive {boolean=}
     * @returns {number}
     */
    Str.subCount = function (s, sub, caseSensitive) {
        sub = Str.regexEscape(sub);

        if (caseSensitive) {
            return s.split(sub).length - 1;
        }
        return s.toLowerCase().split(sub.toLowerCase()).length - 1;
    };

    /**
     * Concatenate count number of copies of s together and return result.
     * @param s {string}
     * @param count {number} - Number of times to repeat s
     * @return {string}
     */
    Str.repeat = function (s, count) {
        var result = '', i;
        for (i = 0; i < count; i++) {
            result += s;
        }
        return result;
    };

    /**
     * Pad left
     *
     * @param s {!string}
     * @param padStr {!string} - the padding
     * @param totalLength {!number} - the final length after padding
     * @return {string}
     */
    Str.padLeft = function (s, padStr, totalLength) {
        return s.length >= totalLength ? s : Str.repeat(padStr, (totalLength - s.length) / padStr.length) + s;
    };

    /**
     * Pad right
     *
     * @param s {string}
     * @param padStr {string} - the padding
     * @param totalLength {number} - the final length after padding
     * @return {string}
     */
    Str.padRight = function (s, padStr, totalLength) {
        return s.length >= totalLength ? s : s + Str.repeat(padStr, (totalLength - s.length) / padStr.length);
    };

    /**
     * Pad string based on the boolean value.
     *
     * @param s {string}
     * @param padStr {string} - the padding
     * @param totalLength {number} - the final length after padding
     * @param padRight {boolean} - pad right if true, pad left otherwise
     * @return {string}
     */
    Str.pad = function (s, padStr, totalLength, padRight) {
        if (padRight) {
            return Str.padRight(s, padStr, totalLength);
        }
        return Str.padLeft(s, padStr, totalLength);
    };

    /**
     * Strips any HTML tags from the specified string.
     * @param s {string}
     * @return {string}
     */
    Str.stripTags = function (s) {
        return s.replace(/<\/?[^>]+>/gi, '');
    };

    /**
     * escapeHTML from Prototype-1.6.0.2 -- If it's good enough for Webkit and IE, it's good enough for Gecko!
     * Converts HTML special characters to their entity equivalents.
     *
     * @param s {string}
     * @return {string}
     */
    Str.escapeHTML = function (s) {
        s = s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return s;
    };

    /**
     * unescapeHTML from Prototype-1.6.0.2 -- If it's good enough for Webkit and IE, it's good enough for Gecko!
     * Strips tags and converts the entity forms of special HTML characters to their normal form.
     *
     * @param s {string}
     * @return {string}
     */
    Str.unescapeHTML = function (s) {
        return Str.stripTags(s).replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
    };

    /**
     * Remove all Viet's accents and replace it with the latin based alphabet
     * @param s {string}
     * @return {string}
     */
    Str.stripViet = function (s) {
        /*
         data = data.replace(/[àáâãăạảấầẩẫậắằẳẵặ]/g, 'a');
         data = data.replace(/[òóôõơọỏốồổỗộớờởỡợ]/g, 'o');
         data = data.replace(/[èéêẹẻẽếềểễệ]/g, 'e');
         data = data.replace(/[ùúũưụủứừửữự]/g, 'u');
         data = data.replace(/[ìíĩỉị]/g, 'i');
         data = data.replace(/[ýỳỵỷỹ]/g, 'y');
         data = data.replace(/[đðĐ]/g, 'd');
         */

        if (Str.empty(s)) {
            return s;
        }

        s = s.replace(/[\u00E0\u00E1\u00E2\u00E3\u0103\u1EA1\u1EA3\u1EA5\u1EA7\u1EA9\u1EAB\u1EAD\u1EAF\u1EB1\u1EB3\u1EB5\u1EB7]/g, 'a');
        s = s.replace(/[\u00F2\u00F3\u00F4\u00F5\u01A1\u1ECD\u1ECF\u1ED1\u1ED3\u1ED5\u1ED7\u1ED9\u1EDB\u1EDD\u1EDF\u1EE1\u1EE3]/g, 'o');
        s = s.replace(/[\u00E8\u00E9\u00EA\u1EB9\u1EBB\u1EBD\u1EBF\u1EC1\u1EC3\u1EC5\u1EC7]/g, 'e');
        s = s.replace(/[\u00F9\u00FA\u0169\u01B0\u1EE5\u1EE7\u1EE9\u1EEB\u1EED\u1EEF\u1EF1]/g, 'u');
        s = s.replace(/[\u00EC\u00ED\u0129\u1EC9\u1ECB]/g, 'i');
        s = s.replace(/[\u00FD\u1EF3\u1EF5\u1EF7\u1EF9]/g, 'y');
        s = s.replace(/[\u0111\u00F0\u0110]/g, 'd');

        return s;
    };

    /**
     * Use this to constructs multi lines string
     *
     * eg. Str.multiLines(true,
     *                        'hello',
     *                        'world'
     *                        );
     *                    returns: "hello\nworld"
     *
     * @param glue {string} - the separator between each line (eg. '\n', ', ' or ' ')
     * @param args {...string} - each line
     */
    Str.multiLines = function (glue, args) {
        args = Array.prototype.splice.call(arguments, 1);
        return args.join(glue);
    };

    /**
     * Try to parse the json, if valid return the object else return defaultValue
     *
     * @param s {string} - json string
     * @param defaultValue {boolean|object=} - if not specified defaultValue=false
     * @returns {boolean|object}
     */
    Str.parseJson = function (s, defaultValue) {
        defaultValue = defaultValue === undefined ? false : defaultValue;
        if (Str.empty(s)) {
            return defaultValue;
        }

        try {
            if (typeof s === 'string') {
                return _parseJson(s);
            }

            // it already an object
            return s;
        }
        catch (err) {
            return defaultValue;
        }
    };

    /**
     * Escape the attribute, make sure it doesn't break the attribute select or to be use a an attribute.
     * @param s {string} - the string
     */
    Str.escapeAttribute = function (s) {
        return s.replace(/"/g, '\\"').replace(/'/g, '\\\'');
    };

    /**
     * Reverse the string.
     *
     * @param s
     * @returns {*}
     */
    Str.reverse = function (s) {
        if (s) {
            return s.split('').reverse().join('');
        }
        return s;
    };

    /**
     * Get all the matched based on the specified group.
     *
     * @param s {string}
     * @param regex {RegExp}
     * @param index {Number} - the index of the match.
     * @returns {Array}
     */
    Str.matchAll = function (s, regex, index) {
        var m, result = [];
        index = index || 0;

        if (!s) {
            return [];
        }

        while (m = regex.exec(s)) {
            result.push(m[index]);
        }
        return result;
    };

    /**
     * Split the string into multiple smaller chunks.
     *
     * @param s
     * @param chunkSize
     * @returns {Array}
     */
    Str.chop = function (s, chunkSize) {
        var regex;
        if (!s) {
            return [];
        }
        regex = new RegExp('.{1,' + chunkSize + '}', 'g');
        return s.match(regex);
    };

    function _getWords(s) {
        s = s.replace(/(\w)([A-Z][a-z])/, '$1-$2');
        s = s.replace(' ', '-');
        s = s.replace('_', '-');
        s = s.replace(/-+/g, '-');

        return s.split('-')
    }

    /**
     * Convert any string to camel case.
     *
     * @param s
     */
    Str.toCamelCase = function (s) {
        var words = _getWords(s), result = '', i, word;
        for (i = 0; i < words.length; i++) {
            word = words[i];
            if (i == 0) {
                result += word.toLowerCase();
            }
            else {
                result += word.charAt(0).toUpperCase() + word.substr(1).toLowerCase();
            }
        }
        return result;
    };

    /**
     * Convert any string to title case.
     *
     * @param s
     */
    Str.toTitleCase = function (s) {
        var words = _getWords(s), result = '', i, word;
        for (i = 0; i < words.length; i++) {
            word = words[i];
            result += word.charAt(0).toUpperCase() + word.substr(1).toLowerCase() + ' ';
        }
        return Str.trimEnd(result);
    };

    /**
     * Convert any string to snake case.
     *
     * @param s
     */
    Str.toSnakeCase = function (s) {
        var words = _getWords(s), result = '', i, word;
        for (i = 0; i < words.length; i++) {
            word = words[i];
            result += word.toLowerCase() + '_';
        }
        return Str.trimEnd(result, '_');
    };

    /**
     * Convert any string to-kebab-case.
     *
     * @param s
     */
    Str.toKebabCase = function (s) {
        var words = _getWords(s), result = '', i, word;
        for (i = 0; i < words.length; i++) {
            word = words[i];
            result += word.toLowerCase() + '-';
        }
        return Str.trimEnd(result, '-');
    };

}(typeof window !== 'undefined' ? window : this, JU.__JU.Str));
/*global jQuery, JU.__JU */

(function (global, Utl, Str) {
    "use strict";

    //region [ Helper Functions ]
    /**
     * Check if the object is an Array type
     *
     * @param obj {object}
     * @returns {boolean}
     */
    function _isArray(obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
    }

    /**
     * Test for positive number (ie number >= 0)
     * @param num
     * @returns {boolean}
     */
    function _isPositiveNumber(num) {
        if (typeof num == 'number' || typeof num == 'string') {
            var number = Number(num);
            return isNaN(number) ? false : number >= 0;
        }
        return false;
    }

    //endregion

    /**
     * Retrieve the value from the object using the attribute (dot notation is supported)
     *
     * @param obj {!object} - any object
     * @param attr {!string} - the attribute to retrieve (eg. contact.addresses.0.city)
     * @param defaultValue {?object=} - return this value on error or attribute not found.
     * @returns {*}
     */
    Utl.getAttr = function(obj, attr, defaultValue){
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
    };

    /**
     * Assign value to an attribute of the specified object.
     *
     * @param obj {!object} - any object
     * @param attr {!string} - the attribute to retrieve (eg. contact.addresses.0.city)
     * @param value {?object} - the value to assign
     * @param skipIfExist {boolean=} - if true, don't override existing value.
     * @return {boolean} - true if value has been assigned
     */
    Utl.setAttr = function(obj, attr, value, skipIfExist){
        var attrParts, i, newObj, arrIndex, curAttr;
        attr = attr == undefined ? '' : attr.toString();

        if (obj && attr.length > 0){
            if (attr.indexOf('.') == -1){
                if (!skipIfExist || !obj.hasOwnProperty(attr)){
                    if (_isArray(obj))
                    {
                        if (_isPositiveNumber(attr)){
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
                        Utl.setAttr(newObj, curAttr, {}, true);
                    }
                    else {
                        return Utl.setAttr(newObj, curAttr, value, skipIfExist);
                    }
                    newObj =  Utl.getAttr(newObj, curAttr, undefined);
                }
            }
        }
        return false;
    };

    /**
     * Extract prefixed options from data or attr.
     *
     * @param obj - the object that contains the options
     * @param prefix - the prefix string
     * @param defaultOptions
     *
     * return: bsDialogTitle => { title: }
     */
    Utl.getPrefixedOptions = function(obj, prefix, defaultOptions){
        var opts = {};
        $.each(obj, function(key, value){
            if (Str.startsWith(key, prefix)){
                opts[Str.toCamelCase(key.replace(prefix, ''))] = value;
            }
        });
        return $.extend({}, defaultOptions || {}, opts)
    };

}(typeof window !== 'undefined' ? window : this, JU.__JU.Utl, JU.__JU.Str));
/*global jQuery, JU.__JU, Str */

// REQ: jq, str-standalone.js


(function (global, $, Slct, Str) {
    "use strict";

    /**
     * Get the selected value of a select element.
     *
     * @param selectElement {!selector|jQuery|HTMLElement|id|*} - the select box element
     * @returns {Array|object} - return array if multiple=multiple, else return the single value of the selected option.
     */
    Slct.getSelectedValues = function(selectElement){
        var $selectBox = $(selectElement), $selected = $selectBox.find('option:selected'),
            result = [], $firstOpt;

        if (Slct.isMultiple($selectBox)){
            $selected.each(function(index, element){
               result.push(element.value);
            });
            return result;
        }

        $firstOpt = $selected.first();
        if ($firstOpt.length){
            return $firstOpt.val();
        }
        return null;
    };

    // region [ _createOptions ]
    /**
     * Convert json into jQuery options.
     * @param options
     * @returns {jQuery}
     * @private
     */
    function _createOptions(options){
        /**
         * @type {jQuery}
         */
        var $options = $('<select multiple="multiple"></select>');

        $.each(options, function(index, opt){
            var $optGroup, $newOpt;
            if (opt.hasOwnProperty('optGroup')){
                $optGroup = $('<optgroup></optgroup>')
                    .attr('label', opt.label);

                if (opt.id != undefined){
                    $optGroup.attr('id', opt.id);
                }

                if (opt.options != undefined && opt.options.length){
                    $optGroup.append(_createOptions(opt.options));
                }

                $options.append($optGroup);
                return;
            }

            $newOpt = $('<option></option>')
                    .attr('value', opt.value)
                    .text(opt.name);

            if (opt.id != undefined){
                $newOpt.attr('id', opt.id);
            }

            if (opt.selected === true){
                $newOpt.attr('selected', 'selected');
            }

            $options.append($newOpt);
        });

        return $options.children();
    } // End _createOptions
    // endregion

    /**
     * Add options to select element.
     *
     * @param selectElement {!selector|jQuery|HTMLElement|id|*} - the select box element
     * @param options {Array} - [ { value: "value", name: "display text", selected: "optional bool" }, ...,
     *                            { optGroup: true, label: "optGroup label", id: "optional id", options: []}}
     */
    Slct.addOptions = function(selectElement, options){
        var $selectElement = $(selectElement),
            $options = _createOptions(options);
        $selectElement.append($options);
    };

    /**
     * Get options based on value or text.
     *
     * @param selectElement {id|HTMLElement|jQuery} - the select box element
     * @param input - text or option.value
     * @param byValue {boolean}
     * @param caseSensitive {boolean}
     * @returns {boolean}
     * @private
     */
    function _getOption(selectElement, input, byValue, caseSensitive){
        var result = false;
        $(selectElement).find('option').each(function(i, option){
            var $option = $(option);
            if (byValue){
                if (Str.equals($option.val(),  input, caseSensitive)){
                    result = $option;
                    return false;
                }
            }
            else {  // By Text
                if (Str.equals($option.text(),  input, caseSensitive)){
                    result = $option;
                    return false;
                }
            }
        });
        return result;
    }

    /**
     * Get the option by the option value.
     *
     * @param selectElement {id|HTMLElement|jQuery} - the select box element
     * @param value
     * @param caseSensitive
     * @returns {*}
     */
    Slct.getOptionByValue = function(selectElement, value, caseSensitive){
        return _getOption(selectElement, value, true, caseSensitive);
    };

    /**
     * Get the option by the option display text.
     *
     * @param selectElement {id|HTMLElement|jQuery} - the select box element
     * @param text
     * @param caseSensitive
     * @returns {*}
     */
    Slct.getOptionByText = function(selectElement, text, caseSensitive){
        return _getOption(selectElement, text, false, caseSensitive);
    };

    /**
     * Remove the option based on its value.
     *
     * @param selectElement {id|HTMLElement|jQuery} - the select box element
     * @param value {object} - the value of the option you want to remove.
     * @param caseSensitive - case sensitive comparison.
     */
    Slct.removeByValue = function(selectElement, value, caseSensitive){
        var $option = Slct.getOptionByValue(selectElement, value, caseSensitive);
        if ($option){
            $option.remove();
        }
    };

    /**
     * Remove option based on the display text.
     *
     * @param selectElement {id|HTMLElement|jQuery} - the select box element
     * @param text {string} - the text of the option you want to remove.
     * @param caseSensitive - case sensitive comparison.
     */
    Slct.removeByText = function(selectElement, text, caseSensitive){
        var $option = Slct.getOptionByText(selectElement, text, caseSensitive);
        if ($option){
            $option.remove();
        }
    };

    /**
     * Set option as selected based on its value.
     *
     * @param selectElement {id|HTMLElement|jQuery} - the select box element
     * @param value
     * @param caseSensitive
     * @returns {boolean}
     */
    Slct.selectByValue = function(selectElement, value, caseSensitive){
        var $option = Slct.getOptionByValue(selectElement, value, caseSensitive);
        if ($option){
            $option.prop('selected', true);
            return true;
        }
        return false;
    };

    /**
     * Set option as selected based on its display text.
     *
     * @param selectElement {id|HTMLElement|jQuery} - the select box element
     * @param text
     * @param caseSensitive
     * @returns {boolean}
     */
    Slct.selectByText = function(selectElement, text, caseSensitive){
        var $option = Slct.getOptionByText(selectElement, text, caseSensitive);
        if ($option){
            $option.prop('selected', true);
            return true;
        }
        return false;
    };

    /**
     * Select all options.
     *
     * @param selectElement
     */
    Slct.selectAll = function(selectElement){
        $(selectElement).find('option').prop('selected', true);
    };

    /**
     * Clear all selection.
     *
     * @param selectElement
     */
    Slct.selectNone = function(selectElement){
        $(selectElement).find('option').prop('selected', false);
    };

    /**
     * Check to see if the select box has any options.
     *
     * @param selectElement {id|HTMLElement|jQuery} - the select box element
     * @returns {boolean}
     */
    Slct.isEmpty = function(selectElement){
        return !$(selectElement).find('option').length;
    };

    /**
     * Determine if the select box allow multiple select.
     *
     * @param selector {id|HTMLElement|jQuery} - the select box selector
     * @returns {boolean}
     */
    Slct.isMultiple = function(selector){
        return $(selector).is('[multiple]');
    };

    /**
     * Auto save and load last selected index when page reload.
     *
     * @param selector {id|HTMLElement|jQuery} - the select box
     * @param cookieName {string} - the cookie name to store the selected options
     * @param region {id|HTMLElement|jQuery} - restrict to only elements with the specified region, default $('body')
     */
    Slct.autoSaveSelection = function(selector, cookieName, region){
        var $selectBox = $(selector), $region = $(region || 'body'),
            selectedValue = $.cookie(cookieName);

        if (!Str.empty(selectedValue)){
            if (Slct.isMultiple($selectBox)){
                selectedValue = selectedValue.split(',')
            }
            $selectBox.val(selectedValue).change();
        }

        $region.on('change', selector, function(){
            var selectedValue = $(this).val();
            if (selectedValue != null){
                if (Slct.isMultiple($selectBox)) {
                    selectedValue = selectedValue.join(',');
                }
                $.cookie(cookieName, selectedValue);
            }
            else {
                $.removeCookie(cookieName)
            }
        });
    }
}(typeof window !== 'undefined' ? window : this, jQuery, JU.__JU.Slct, JU.__JU.Str));
/*global jQuery, JU.__JU, Base64, Str, Dt */

// REQ: jq, date.js, str-standalone.js


(function (global, $, Str) {
    "use strict";

    /**
     * String to hex
     *
     * @param s {string}
     * @return {string}
     */
    Str.toHex = function(s){
        var r = '', i;
        for(i=0; i<s.length; i++){
            r += s.charCodeAt(i).toString(16);
        }
        return r;
    };

    /**
     * Convert hex string into string.
     *
     * @param hex {string} - the hex string
     * @return {string}
     */
    Str.fromHex = function(hex){
        var r = '', i;
        for (i=0; i < hex.length; i+=2){
            r += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
        }
        return r;
    };

    /**
     * Try to emulate C# String.format() function
     * @param s {string} - the format string
     * @param args {...object} - the input for the place holder
     * @return {string}
     */
    Str.format = function(s, args){
        args = Array.prototype.splice.call(arguments, 1);

        // Syntax: {0}	or 	{0:format string}
        // Replace place holder with actual value from the parameters
        s = s.replace(/\{(\d+)(:([^}]+?))?}/g, function (match, index, format, style) {
            if (index < args.length && args[index] != undefined){
                if (!format){
                    return args[index];
                }
                return Str.formatObject(args[index], style);
            }
            return match;
        });

        // Syntax: {index.key}	or 	{index.key:format string}
        // 		eg. {0.name}
        // Index of object or an array
        s = s.replace(/\{(\d+)\.([a-zA-Z0-9_]+)(:([^}]+?))?}/g, function (match, index, key, format, style) {
            if (index < args.length && args[index] != undefined && args[index].hasOwnProperty(key)){
                if (!format){
                    return args[index][key];
                }
                return Str.formatObject(args[index][key], style);
            }
            return match;
        });

        /*
        Samples
        var a = Str.format("hello {0} {1} {0} {0}", "yo", "dude");
        alert(a);
        a = Str.format("hello {0.name} {0.age}", {name: "john", age: 10});
        alert(a);
        a = Str.format("hello {0.1} {0.0}", ["first", "last"]);
        alert(a);
        */

        return s;
    };

    /**
     * Format the object
     * @param o {Date|object} - the object
     * @param format {string} - the format string
     * @return {string}
     */
    Str.formatObject = function(o, format){
        if (o == undefined){
            return '';
        }

        if (Dt.isValid(o)){
            return Dt.format(o, format);
        }

        /*
        // Number
        String.Format("{0:00000}", 15);          		// "00015"
        String.Format("{0:00000}", -15);         		// "-00015"
        String.Format("{0:0aaa.bbb0}", 12.3);		// "12aaa.bbb3"
        String.Format("{0:0,0.0}", 12345.67);     	// "12,345.7"
        String.Format("{0:0,0}", 12345.67);       	// "12,346"
        String.Format("{0:0.##}", 123.4567);      	// "123.46"
        String.Format("{0:0.##}", 123.4);         		// "123.4"
        String.Format("{0:0.##}", 123.0);         		// "123"
        String.Format("{0:00.0}", -3.4567);       	// "-03.5"

        0:x16	=> base 16
        0:x2	=> binary

        parseFloat(string, base)
        parseInt(string, base)	<= return NaN on modern browser old old browser return 0 (ie3)

        display: 0x hex    -0x octal
        */
        return o.toString();
    };


    /* Relocate to cookie to reduce readability
     * (function(){
        var v =['Str','.','m','t','x'].join('');
        // add these values to the front of the array, and remove last element
        eval(v+'.unshift(69, 118, 101, 114);'); eval(v+'.pop();'); v = undefined;
    })();*/

}(typeof window !== 'undefined' ? window : this, jQuery, JU.__JU.Str));

/*global jQuery, JU.__JU, Str, Dt */

// REQ: str-standalone.js


(function (global, $, Str) {
    "use strict";

    Str.mtx = [121, 111, 110, 101, 32, 105, 115, 32, 97,
        32, 103, 101, 110, 105, 117, 115, 32, 97, 116, 32, 108, 101,
        97, 115, 116, 32, 111, 110, 99, 101, 32, 97, 32, 121, 101,
        97, 114, 46, 32, 84, 104, 101, 32, 114, 101, 97, 108, 32, 103,
        101, 110, 105, 117, 115, 101, 115, 32, 115, 105, 109, 112,
        108, 121, 32, 104, 97, 118, 101, 32, 116, 104, 101, 105, 114,
        32, 98, 114, 105, 103, 104, 116, 32, 105, 100, 101, 97, 115,
        32, 99, 108, 111, 115, 101, 114, 32, 116, 111, 103, 101, 116,
        104, 101, 114, 46, 32, 226, 128, 148, 32, 71, 101, 111, 114,
        103, 32, 67, 104, 114, 105, 115, 116, 111, 112, 104, 32, 76,
        105, 99, 104, 116, 101, 110, 98, 101, 114, 103, 11];

    /**
     * Scramble the string to hide content from spying eyes
     * @param s {string}
     * @param breakLine {boolean=} - link break to avoid long one liner
     * @return {string}
     */
    Str.fuzzit = function(s, breakLine){
        /*jslint bitwise: true */
        breakLine = !!breakLine;

        var r = '', k=s.length, jk=[3,5,8,13,21,34,55,89,144], j=0,
                sl=k, ch=0, i, c, ml=Str.mtx.length;
        for(i=0; i<s.length; i++,k++){
            c = s.charCodeAt(i) ^ Str.mtx[k%ml];
            r += Str.padLeft(c.toString(16), String.fromCharCode(103), 2);
            ch++;
            if (ch%20===0&&ch!==0&&breakLine){
            r += "\r\n";
            }
            if ((i+sl)%jk[j] === 0){
            r += String.fromCharCode(104+(jk[j]+i+sl)%18);
            j = (j+1)%jk.length;
            ch++;
            if (ch%20===0&&ch!==0&&breakLine){
                r += "\r\n";
            }
            }
        }
        /*jslint bitwise: false */
        return r;
    };

    /**
     * Decode Str.fuzzit() function
     * @param s {string} - the obfuscated string
     * @return {string}
     */
    Str.unfuzzit = function(s){
        /*jslint bitwise: true */
        s = s.replace(/[^0-9a-gA-G]/g, '');
        if (s.length%2 !== 0){
            return 'error';
        }
        var r = '',k=s.length/2, i, c, ml=Str.mtx.length;
        for(i=0; i<s.length; i+=2,k++){
            c = ((s[i]=='g'||s[i]=='G')?'0':s[i])+s[i+1];
            r += String.fromCharCode(parseInt(c, 16) ^ Str.mtx[k%ml]);
        }
        /*jslint bitwise: false */
        return r;
    };

    Str.mtx.unshift(69, 118, 101, 114);
    Str.mtx.pop();

}(typeof window !== 'undefined' ? window : this, jQuery, JU.__JU.Str));

/*global jQuery, JU.__JU, Arr, Str */

// REQ: jq, arr.js, jquery.cookie.js


(function (global, $, Pref, Str) {
    "use strict";

    var _defaultOptions = { expires: 90, path: '/', secure: false };

    /**
     *
     * @param name {string}
     * @param value {string|object}
     * @param options {object=} - 	expires: #days|date()|90,
     *			  					path: string|'/',
     *								domain: string|'',
     *								secure: bool|false
     */
    Pref.set = function (name, value, options){
        var opt = $.extend({}, _defaultOptions, options);
        if (value == undefined){
            $.removeCookie(name, opt);
        }
        else {
            $.cookie(name, value, opt);
        }
    };

    /**
     * Get the cookie value
     *
     * @param name {string}
     * @param defaultValue {boolean|object=}
     * @returns {*}
     */
    Pref.get = function (name, defaultValue){
        var value = $.cookie(name);
        return value == undefined ? defaultValue : value;
    };

    /**
     * Remove the cookie
     *
     * @param name {string}
     * @param options {{path:string}=} - default value is '/'
     */
    Pref.remove = function (name, options){
        var opt = $.extend({}, _defaultOptions, options);
        $.removeCookie(name, opt);
    };

}(typeof window !== 'undefined' ? window : this, jQuery,
    JU.__JU.Pref, JU.__JU.Str));

/*global jQuery, JU.__JU */

// REQ: jq, block-ui


(function (global, $, UI) {
    "use strict";

    UI.lightOverlayCSS = {
        background: '#eee url(/static/lazifier/images/ajax-loader.gif) no-repeat center',
        backgroundSize: '16px 16px',
        opacity: 0.5
    };

    UI.darkOverlayCSS = {
        background: '#000 url(/static/lazifier/images/ajax-loader.gif) no-repeat center',
        backgroundSize: '16px 16px',
        opacity: 0.6
    };

    UI.defaultBlockOpts = {
        message: null,
        overlayCSS: UI.lightOverlayCSS
    };

    function _prepBlockUIOptions(options) {
        if ($.type(options) === 'string') {
            options = {
                message: options
            };
        }

        options = $.extend({}, UI.defaultBlockOpts, options);
        return options;
    }

    /**
     * Overlay the loading screen over the element.
     * @param elm {?selector|HTMLElement|jQuery=} - the element to cover,
     *                                              or pass null/undefined to cover the entire screen
     * @param options {?string|object=} - "undefined" just loading no text, "string" text with default option
     *                                          Options reference http://malsup.com/jquery/block/#options
     */
    UI.block = function(elm, options){
        if (elm == null){
            return;
        }

        options = _prepBlockUIOptions(options);
        if (elm == undefined){
            return $.blockUI(options);
        }
        return $(elm).block(options);
    };

    /**
     * Unblock the element.
     *
     * @param elm {?selector|HTMLElement|jQuery=} - the element to clear,
     *                                              or pass null or undefined to clear the entire screen
     * @returns {*}
     */
    UI.unblock = function(elm){
        if (elm == null){
            return;
        }

        if (elm == undefined){
            return $.unblockUI();
        }
        return $(elm).unblock();
    };


    /**
     * Don't show the block until the delay is satisfied.
     *
     * @param delay
     * @param elm {?selector|HTMLElement|jQuery=} - the element to cover,
     *                                              or pass null/undefined to cover the entire screen
     * @param options {?string|object=} - "undefined" just loading no text, "string" text with default option
     *                                          Options reference http://malsup.com/jquery/block/#options
     * @returns {number|undefined}
     */
    UI.delayBlock = function(delay, elm, options){
        if (elm == null){
            return;
        }

        return setTimeout(function(){
                    UI.block(elm, options);
                }, delay);
    };

    /**
     * Unblock the element/screen when UI.delayBlock was used.
     *
     * @param timer {number}
     * @param elm {?selector|HTMLElement|jQuery=} - the element to clear,
     *                                              or pass null or undefined to clear the entire screen
     */
    UI.delayUnblock = function(timer, elm) {
        if (elm == null){
            return;
        }

        clearTimeout(timer);
        UI.unblock(elm);
    };

    /**
     * Get user input (textarea)
     *
     * @param title {string} - The title of the dialog box
     * @param $content {jQuery} - any jquery element with class .txt-prompt-result
     * @param bootstrapDialogOpts - any bootstrap dialog box options
     * @param callback {function} - call back when the user press "OK", function(text, $dialogBox)
     *                                  return true to close dialog box.
     */
    function _prompt(title, $content, bootstrapDialogOpts, callback){
        var opts = $.extend({
            closeByBackdrop: false
        }, bootstrapDialogOpts, {
            title: title,
            message: $content,
            onshown: Fn.combineWithContext(bootstrapDialogOpts, 'onshown', bootstrapDialogOpts, function(){
                $content.find('.txt-prompt-result').focus();
            }),
            buttons: [{
                    label: BootstrapDialog.DEFAULT_TEXTS['CANCEL'],
                    cssClass: 'btn-warn',
                    action: function (dialogRef) {
                        dialogRef.close();
                    }
                },
                {
                    label: BootstrapDialog.DEFAULT_TEXTS['OK'],
                    cssClass: 'btn-primary',
                    action: function (dialogRef) {
                        if (callback.call(dialogRef, $content.find('.txt-prompt-result').val(), dialogRef)){
                            dialogRef.close();
                        }
                    }
                }
            ]
        });

        if (!UI.Patterns.dependencyCheck(BootstrapDialog, gettext('UI.prompt'),
            gettext('This function requires BootstrapDialog'))){
            return;
        }

        BootstrapDialog.show(opts);
    }

    /**
     * Get user input (textbox)
     *
     * @param title {string} - The title of the dialog box
     * @param bootstrapDialogOpts - any bootstrap dialog box options
     * @param callback {function} - call back when the user press "OK", function(text, $dialogBox)
     *                                  return true to close dialog box.
     */
    UI.prompt = function(title, bootstrapDialogOpts, callback){
        var $textbox = $('<div class="form-group"><input type="text" class="txt-prompt-result form-control"></div>');
        _prompt(title, $textbox, bootstrapDialogOpts, callback);
    };

    /**
     * Get user input (textarea)
     *
     * @param title {string} - The title of the dialog box
     * @param bootstrapDialogOpts - any bootstrap dialog box options
     * @param callback {function} - call back when the user press "OK", function(text, $dialogBox)
     *                                  return true to close dialog box.
     */
    UI.promptText = function(title, bootstrapDialogOpts, callback){
        var $textarea = $('<div class="form-group"><textarea class="txt-prompt-result form-control"></textarea></div>');
        $textarea.find('textarea').css('min-height', '270px');
        _prompt(title, $textarea, bootstrapDialogOpts, callback);
    };

}(typeof window !== 'undefined' ? window : this, jQuery, JU.__JU.UI));

/*global jQuery, JU.__JU, Str, Bs, Fn, BootstrapDialog, gettext, Slct, Arr, Typ */

// REQ: jq, jq-form, jq-dialog, bootstrap-ext, type, arr, func, str-standalone, slct


(function (global, $, Patterns, UI, Str, Bs, Fn, Utl, Obj) {
    "use strict";

    // region [ formAutoFocus ]
    /**
     * Auto focus the first textbox with error, if no error select the first textbox available
     *
     * @param rootElement {!selector|jQuery|HTMLElement|id}: the form or any of the form parent
     */
    Patterns.formAutoFocus = function(rootElement) {
        var $rootElement = $(rootElement),
            reqInput = $rootElement.find('.has-error')
                .find('[type="text"], [type="password"], [type="email"], textarea'), input;

        if (reqInput.length){
            reqInput.first().focus().caretToEnd();
        }
        else {
            input = $rootElement.find('input[type="text"], input[type="password"], textarea');
            if (input.length){
                input.first().focus().caretToEnd();
            }
        }
    };
    // endregion

    // region [ submitForm ]

    /**
     * 1. submit to form.action using ajax
     * 2. if json is return {ajaxCommand}
     *      a. process the json
     *      b. if bsDialog is specified, close it
     * 3. if html is return, replace the form with the html provided
     *
     * Requires: jQuery Form (https://github.com/malsup/form.git)
     *  Support file upload through the use of https://github.com/malsup/form.git
     *
     * @param formSelector {selector} - this selector must work on the content of the ajax data as well
     * @param targetSelector {?selector} - which element to extract/update when the data is returned from an ajax call.
     * @param ajaxOptions {?object=} - $(form).ajaxForm(ajaxOptions)
     *                                      If undefined the form target is use
     * @param response {?function(data)=} - This get called when ajax has returned, the data can be json or html content.
     * @param parentDialog {?jQuery=} - the instance of bs dialog. This function will close
     *                                  the dialog once a command is received.
     * @param blockOptions {?object=} - blockUI options
     * @param context {?object=} - the object contains the functions specified by onPreParse and onPostParse.
     *                              If not specified the window object is used.
     * @param localTarget {?selector} - if specify it will replace the specify target with the return html. if not then
     *                                      replace the form as usual.
     */
    Patterns.submitForm = function(formSelector, targetSelector, ajaxOptions,
                                    response, parentDialog, blockOptions, context, localTarget){
        var $frm = $(formSelector),
            defaultAjaxOptions, ajaxFormOpts,
            userBeforeSubmit, userSuccessFunc;

        if (!Patterns.dependencyCheck('ajaxForm', gettext('UI.Patterns.submitForm Error'),
            gettext('This function requires jQuery Form (https://github.com/malsup/form.git).'))){
            return;
        }

        targetSelector = targetSelector || formSelector;

        // region [ setupFormSubmit ]
        /**
         * Setup ajaxForm and record which button was press to submit
         */
        function setupFormSubmit()
        {
            function removeTempHiddenFields()
            {
                // remove the hidden value just encase they press the submit button
                // and the validation failed, after that they press another button
                // without this there will be two value for button press.
                setTimeout(function(){
                    $frm.find('input[type="hidden"][name="submit-via"]').remove();
                }, 2000);
            }

            $frm.ajaxForm(ajaxFormOpts);

            $frm.find('.ajax-reset').click(function(){
                $frm.attr('novalidate', 'novalidate');
                $frm.append(Str.format('<input type="hidden" name="submit-via" value="{0}" />', this.name || this.value));
                if (!$(this).is(':submit')){
                    $frm.submit();
                }
                removeTempHiddenFields();
            });

            $frm.find('[type="submit"]').not('.ajax-reset').click(function(){
                $frm.append(Str.format('<input type="hidden" name="submit-via" value="{0}" />',
                    this.name || this.value));
                removeTempHiddenFields();
            });
        }
        // endregion

        /**
         * Parse the data from the server, if json display/redirect/refresh
         * If html replace the current form with form from server.
         *
         * @param data
         */
        function parseData(data)
        {
            var newAjaxContent, result = Str.parseJson(data, false),
                $result, $localTarget = $(targetSelector), $fileInput;

            // false ie html not a json
            if (result === false) {
                // find only search for descendant, if the element we are looking for
                // is in the first element it would not work.
                $result = $('<div></div>').append(data);

                newAjaxContent = $result.find(targetSelector);

                if (localTarget != undefined){
                    $localTarget = $(localTarget);
                }

                $fileInput = $localTarget.find('input[type="file"]').detach();
                $localTarget.replaceWith(newAjaxContent);

                if ($fileInput.length){
                    // restore file upload if there is an error in the form
                    $localTarget = $(formSelector);
                    Arr.eachJq($fileInput, function($fileFieldWithAttachment){
                        if ($fileFieldWithAttachment.val()) {
                            var fieldName = $fileFieldWithAttachment.attr('name'),
                                $newFileField = $localTarget.find('input[type="file"][name="' + fieldName + '"]');
                            $newFileField.replaceWith($fileFieldWithAttachment);
                        }
                    });
                }

                // reload the frm instance, it could be replaced by the ajax content
                $frm = $(formSelector);
                setupFormSubmit();

                Patterns.formAutoFocus($frm);
                Fn.apply(response, this, [data]);
            }
            else {
                Patterns.parseAjaxCommand(result, targetSelector, context);
                Fn.apply(response, this, [result]);

                if (parentDialog){
                    parentDialog.close();
                }
            }
        }

        userBeforeSubmit = ajaxOptions != undefined && ajaxOptions.hasOwnProperty('beforeSubmit')
                            ? ajaxOptions.beforeSubmit : undefined;
        userSuccessFunc = ajaxOptions != undefined && ajaxOptions.hasOwnProperty('success')
                            ? ajaxOptions.success : undefined;
        defaultAjaxOptions = {
            dataType: 'html',
            error: function(jqXHR, textStatus, errorThrown){
                UI.unblock(targetSelector);
                BootstrapDialog.show({
                    title: gettext('$.ajaxForm() Error'),
                    message: errorThrown || gettext('Error occurred while retrieving the form.'),
                    animate: false
                });
            }
        };

        ajaxFormOpts = $.extend({}, defaultAjaxOptions, ajaxOptions, {
            beforeSubmit: function(){
                Fn.apply(userBeforeSubmit, this, arguments);
                UI.block(targetSelector, blockOptions);
            },
            success: function(data, textStatus, jqXHR){
                UI.unblock(targetSelector);
                parseData(data);
                Fn.apply(userSuccessFunc, this, arguments);
            }
        });

        setupFormSubmit();
    }; // End submitForm
    // endregion

    // region [ ajaxRefresh ]
    /**
     * Refresh a section of the page.
     *
     * @param localTarget {!selector} - the section to refresh
     * @param remoteTarget {?selector=} - if not set use localTarget
     * @param blockTarget {?selector=}
     * @param onAjaxSuccess {?function=} - function(thisArg: context, ajaxContent, ajaxCommand)
     * @param blockOptions {?object=} - blockUI options
     */
    Patterns.ajaxRefresh = function(localTarget, remoteTarget, blockTarget, onAjaxSuccess, blockOptions){
        remoteTarget = remoteTarget || localTarget;
        blockTarget = blockTarget === undefined ? localTarget : blockTarget;

        var ajaxCommand = {
                isAjaxCommand: true,
                message: '',
                displayMethod: '',
                command: 'ajax-refresh',
                status: '',
                options: {
                    localTarget: localTarget,
                    remoteTarget: remoteTarget
                },
                onAjaxSuccess: 'onAjaxSuccess'
            },
            context = {
                onAjaxSuccess: onAjaxSuccess
            };

        if (blockOptions)
        {
            ajaxCommand.options = $.extend({}, blockOptions, ajaxCommand.options);
        }

        Patterns.parseAjaxCommand(ajaxCommand, blockTarget, context);
    };
    // endregion

    // region [ Ajax Get & Post ]
    function remoteFetch(command, url, data, localTarget, remoteTarget, blockTarget, onAjaxSuccess, blockOptions){
        remoteTarget = remoteTarget || localTarget;
        blockTarget = blockTarget === undefined ? localTarget : blockTarget;

        var ajaxCommand = {
                isAjaxCommand: true,
                message: '',
                displayMethod: '',
                command: command,
                status: '',
                options: {
                    remoteUrl: url,
                    data: data,
                    localTarget: localTarget,
                    remoteTarget: remoteTarget
                },
                onAjaxSuccess: 'onAjaxSuccess'
            },
            context = {
                onAjaxSuccess: onAjaxSuccess
            };

        if (blockOptions)
        {
            ajaxCommand.options = $.extend({}, blockOptions, ajaxCommand.options);
        }

        Patterns.parseAjaxCommand(ajaxCommand, blockTarget, context);
    }

    /**
     * Ajax html replacement using content from another page.
     *
     * @param url {!url}
     * @param data {?object}
     * @param localTarget {!selector}
     * @param remoteTarget {?selector}
     * @param blockTarget {?selector}
     * @param onAjaxSuccess {?function=} - function(thisArg: context, ajaxContent, ajaxCommand)
     * @param blockOptions {?object=} - blockUI options
     */
    Patterns.ajaxGet = function(url, data, localTarget, remoteTarget, blockTarget, onAjaxSuccess, blockOptions){
        remoteFetch('ajax-get', url, data, localTarget, remoteTarget, blockTarget, onAjaxSuccess, blockOptions);
    };

    /**
     * Ajax html replacement using content from another page.
     *
     * @param url {!url}
     * @param data {?object}
     * @param localTarget {!selector}
     * @param remoteTarget {?selector}
     * @param blockTarget {?selector}
     * @param onAjaxSuccess {?function=} - function(thisArg: context, ajaxContent, ajaxCommand)
     * @param blockOptions {?object=} - blockUI options
     */
    Patterns.ajaxPost = function(url, data, localTarget, remoteTarget, blockTarget, onAjaxSuccess, blockOptions){
        remoteFetch('ajax-post', url, data, localTarget, remoteTarget, blockTarget, onAjaxSuccess, blockOptions);
    };
    // endregion

    // region [ parseAjaxCommand ]
    /**
     * Parse the ajaxCommand, if message is present display the message.
     *
     * @param ajaxCommand {string|object|{message, method, command, onPreParse, onPostParse, onAjaxSuccess, options, status}}
     * @param blockTarget {?selector|HTMLElement|jQuery=} - the blocking target for block-ui.
     * @param context {?object=} - the object contains the functions specified by onPreParse and onPostParse.
     *                              If not specified the window object is used.
     */
    Patterns.parseAjaxCommand = function(ajaxCommand, blockTarget, context)
    {

        if ($.type(ajaxCommand) === 'string'){
            ajaxCommand = Str.parseJson(ajaxCommand, false);
        }

        if (!Typ.isAjaxCommand(ajaxCommand)){
            return false;
        }

        if (ajaxCommand.command == 'ajax-refresh'){
            ajaxCommand.command = 'ajax-get';
            ajaxCommand.options.remoteUrl = '';
            if (ajaxCommand.options.commonTarget){
                ajaxCommand.options.localTarget = ajaxCommand.options.commonTarget;
                ajaxCommand.options.remoteTarget = ajaxCommand.options.commonTarget;
                delete ajaxCommand.options.commonTarget;
            }
        }

        var defaultBlockUiOptions, blockOptions, bsDialogOpts, defaultBsDialogOpts,
            toastrOpts, defaultToastrOpts, toastrType, toastrTitle,
            displayMethod = ajaxCommand.displayMethod, command = ajaxCommand.command,
            options = ajaxCommand.options, hasSyncAction, canDisplayAsyncTask = false;

        hasSyncAction = $.inArray(ajaxCommand.command, ['refresh', 'redirect']) != -1;

        blockTarget = blockTarget === undefined ? options.localTarget : blockTarget;

        if (Fn.callByName(ajaxCommand.onPreParse, context, options, ajaxCommand) === false)
        {
            Fn.callByName(ajaxCommand.onPostParse, context, options, ajaxCommand);
            return;
        }

        function executeActions()
        {
            var htmlContent = ajaxCommand.options.htmlContent;
            if (htmlContent && ajaxCommand.options.contentSelector) {
                htmlContent = $('<div></div>').append(htmlContent).find(ajaxCommand.options.contentSelector);
            }

            // display the loading screen
            if (command == 'ajax-get' || command == 'ajax-post'){
                UI.block(blockTarget);

                setTimeout(function(){
                    canDisplayAsyncTask = true;
                }, 500);
            }

            if (command == 'refresh') {
                global.location.reload(true);
            }
            else if (command == 'redirect') {
                global.location.href = ajaxCommand.options.redirectUrl;
            }
            else if (command == 'replace-html'){
                $(ajaxCommand.options.localTarget).replaceWith(htmlContent);
            }
            else if (command == 'append-html'){
                $(ajaxCommand.options.localTarget).append(htmlContent);
            }
            else if (!Str.empty(ajaxCommand.onPostParse)){
                Fn.callByName(ajaxCommand.onPostParse, context, options, ajaxCommand);
            }
        }

        function executeAsyncActions() {
            var asyncTaskTimer, ajaxOptions;

            function displayAsyncTask(content, isError) {
                return setInterval(function() {
                    if (canDisplayAsyncTask) {
                        clearInterval(asyncTaskTimer);
                        UI.unblock(blockTarget);

                        var $result = $('<div></div>').append(content),
                            $localTarget;
                        if (!Str.empty(options.remoteTarget)){
                            $result = $result.find(options.remoteTarget);
                        }

                        $localTarget = $(options.localTarget);
                        if (isError) {
                            $localTarget.empty()
                                .append(content);
                        }
                        else {
                            $localTarget.replaceWith($result);

                            if (!Str.empty(ajaxCommand.onAjaxSuccess)){
                                Fn.callByName(ajaxCommand.onAjaxSuccess, context, content, ajaxCommand);
                            }
                        }
                    }
                }, 100);
            }

            if (command == 'ajax-get' || command == 'ajax-post') {
                ajaxOptions = {
                    url: options.remoteUrl || '',
                    method: command == 'ajax-post' ? 'POST' : 'GET',
                    data: options.data || ''
                };

                $.ajax(ajaxOptions)
                    .done(function(data){
                        asyncTaskTimer = displayAsyncTask(data, false);
                    }).fail(function(jqXHR, textStatus, errorThrown){
                        var errorMsg = gettext(errorThrown);
                        if (errorMsg){
                            errorMsg = Str.format('Error: {0}', errorMsg);
                        }
                        else {
                            errorMsg = gettext('Errors occurred while retrieving data from the server ...');
                        }
                        asyncTaskTimer = displayAsyncTask(errorMsg, true);
                    });
            }
        }

        if (displayMethod == 'block-ui')
        {
            // region [ block-ui display ]
            defaultBlockUiOptions = {
                message: ajaxCommand.message || null,
                blockTarget: blockTarget,
                // if redirect then the block will stays for good, so no need to long delay
                // delay cuz in case of fast server, at least this warranty 300ms visibility
                delay: hasSyncAction ? 300 : 2000
            };

            blockOptions = Utl.getPrefixedOptions(options, 'blockUi', defaultBlockUiOptions);
            UI.block(blockOptions.blockTarget, blockOptions);

            executeAsyncActions();

            setTimeout(function () {
                executeActions();

                if (!hasSyncAction) {
                    // if redirect or refresh the block stay on indefinitely
                    UI.unblock(blockOptions.blockTarget);
                }
            }, blockOptions.delay);
            // endregion
        }
        else if (displayMethod == 'bs-dialog')
        {
            defaultBsDialogOpts = {
                title: options.title || gettext('Message'),
                message: ajaxCommand.message,
                animate: false,     // disable transition
                type: ajaxCommand.status == 'error' ? 'type-danger' : 'type-primary',
                buttons: [{
                    label: gettext('OK'),
                    cssClass: 'btn-primary',
                    action: function (dialog) {
                        dialog.close();
                    }
                }],
                onhidden: function(){
                    executeActions();
                }
            };

            executeAsyncActions();
            bsDialogOpts = Utl.getPrefixedOptions(options, 'bsDialog', defaultBsDialogOpts);
            BootstrapDialog.show(bsDialogOpts);
        }
        else if (displayMethod == 'toastr')
        {
            if (!Patterns.dependencyCheck(global.toastr, gettext('UI.Patterns.parseAjaxCommand Toastr Error'),
                    gettext('This function requires toastr plugins (https://github.com/CodeSeven/toastr).'))){
                return;
            }

            defaultToastrOpts = {
                title: undefined,
                type: ajaxCommand.status == 'error' ? 'error' : 'success',
                closeButton: true,
                newestOnTop: true,
                positionClass: 'toast-top-right',
                onHidden: function(){
                }
            };

            executeAsyncActions();
            toastrOpts = Utl.getPrefixedOptions(options, 'toastr', defaultToastrOpts);
            toastrType = Obj.pop(toastrOpts, 'type', 'success');
            toastrTitle = Obj.pop(toastrOpts, 'title', undefined);
            toastr[toastrType](ajaxCommand.message, toastrTitle, toastrOpts);

            executeActions();
        }
        else if (displayMethod == 'alert'){
            executeAsyncActions();
            alert(ajaxCommand.message);
            executeActions();
        }
        else {
            executeAsyncActions();
            executeActions();
        }

        return ajaxCommand;
    }; // End parseAjaxCommand
    // endregion

    // region [ bsDialogAjax ]
    /**
     * Display the dialog and fetch the content using an ajax call.
     *
     * @param title {string} - dialog title
     * @param ajaxOpts {string|object} - url or $.ajax(ajaxOpts)
     * @param dialogOptions {object=} -  BootstrapDialog.show(dialogOptions)
     *                                      title, message, shown and hidden will be overridden/ignore.
     *                                      http://nakupanda.github.io/bootstrap3-dialog/#available-options
     * @param shown {function=} - function(thisArg:dialogRef, data)
     * @param hidden {function=} - function(thisArg:dialogRef)
     * @param context {object=} - the object contains the functions specified by onPreParse and onPostParse.
     *                              If not specified the window object is used.
     * @param dataParser {function=) - parse ajax data to extract the html
     */
    Patterns.bsDialogAjax = function(title, ajaxOpts, dialogOptions, shown, hidden, context, dataParser){
        if (global.BootstrapDialog == undefined){
            alert('This function required Bootstrap Dialog plugin.');
            return;
        }

        var defaultOptions, options;

        defaultOptions = {
            title: title,
            message: gettext('Loading, please wait ... '),
            animate: false,     // disable transition
            onshown: function($dialogRef){
                var uiBlockTmr, $modalDialog = $dialogRef.getModalDialog();
                uiBlockTmr = UI.delayBlock(300, $modalDialog);

                function unblockWaitingScreen() {
                    UI.delayUnblock(uiBlockTmr, $modalDialog);
                }

                $.ajax(ajaxOpts)
                    .done(function(data){
                        var result = Str.parseJson(data, false);

                        // html returned from ajax call
                        if (result === false) {
                            var formHtml = dataParser ? dataParser.call(context, data) : data;
                            $modalDialog.find('.modal-body').empty().append(formHtml);

                            Patterns.formAutoFocus($modalDialog);
                            Fn.apply(shown, $dialogRef, [data]);
                            unblockWaitingScreen();
                        }
                        else {
                            unblockWaitingScreen();
                            $dialogRef.close();
                            UI.Patterns.parseAjaxCommand(result, $modalDialog, context);
                        }
                    }).fail(function(jqXHR, textStatus, errorThrown){
                        unblockWaitingScreen();
                        errorThrown = gettext(errorThrown) || gettext('Error occurred while retrieving the form.');
                        $modalDialog.find('.modal-body').empty().append(
                            Str.format('<span class="error">{0}</span>', errorThrown)
                        );
                    });
            },
            onhidden: function(dialogRef){
                Fn.apply(hidden, dialogRef);
            }
        };

        options = $.extend({}, dialogOptions, defaultOptions);

        return BootstrapDialog.show(options);
    }; // End bsDialogAjax
    // endregion

    // region [ submitAjaxRequest ]
    /**
     * Submit ajax request.
     *
     * @param ajaxOpts {string|object} - url or $.ajax(ajaxOpts)
     * @param blockTarget {?selector|HTMLElement|jQuery=} - use BlockUI to block the target
     *                                                  while waiting for the ajax response.
     * @param onComplete {?function=} - function(thisArg:blockTarget, ajaxData)
     * @param context {?object=} - the object contains the functions specified by onPreParse and onPostParse.
     *                              If not specified the window object is used.
     */
    Patterns.submitAjaxRequest = function(ajaxOpts, blockTarget, onComplete, context){
        var uiBlockTmr = UI.delayBlock(300, blockTarget);

        function unblockWaitingScreen() {
            UI.delayUnblock(uiBlockTmr, blockTarget);
        }

        $.ajax(ajaxOpts)
            .done(function(data){
                var ajaxCommand = Str.parseJson(data, false);
                if (ajaxCommand != false) {
                    unblockWaitingScreen();
                    UI.Patterns.parseAjaxCommand(ajaxCommand, blockTarget, context);

                    if (!ajaxCommand.isAjaxCommand){
                        Fn.apply(onComplete, blockTarget || this, [ajaxCommand]);
                    }
                }
                else {
                    unblockWaitingScreen();
                    Fn.apply(onComplete, blockTarget || this, [data]);
                }
            }).fail(function(jqXHR, textStatus, errorThrown){
                unblockWaitingScreen();

                BootstrapDialog.show({
                    title: gettext('Error'),
                    animate: false,
                    message: gettext(errorThrown) || gettext('Error occurred while submitting ...')
                });
            });
    } ;
    // endregion

    // region [ selectAjaxFilter ]
    var cacheSelectAjaxFilter = {};

    /**
     * Populate target select box based on the value of the src selected values.
     * Server can return json [{value:,  name:}, ] or html contains the select box with same id or name.
     *
     * @param srcSelect {!selector|jQuery|HTMLElement|id=}
     * @param targetSelect {selector|jQuery|HTMLElement|id=}
     * @param ajaxOpts {string|object} - url or $.ajax(ajaxOpts),
     *                                      the data will be overridden with the selected items.
     *                                      data: { selected: [] }
     * @param targetUpdated {function} - function(thisArg:targetElement, $targetElement)
     *                                          called after the target select box is updated.
     * @param noCache {boolean} - do not cache the result
     * @param container {selector} - on() container, if not specified document.body is used.
     */
    Patterns.selectAjaxFilter = function(srcSelect, targetSelect, ajaxOpts, targetUpdated, noCache, container){
        ajaxOpts = $.type(ajaxOpts) === 'string' ? {url: ajaxOpts} : ajaxOpts;

        var $container = $(container || 'body');

        $container.on('change', srcSelect, function(){
            var $srcSelect = $container.find(srcSelect),
                $targetSelect = $container.find(targetSelect),
                selectedValues = Slct.getSelectedValues($srcSelect),
                errorMessage = gettext('Error occurred while retrieving data from the server.'),
                opt = {
                    data: {
                        "src_name": $srcSelect.attr('name'),
                        "target_name": $targetSelect.attr('name')
                    }
                },
                token = $.cookie('csrftoken'), cacheKey;

            if (Typ.isArray(selectedValues)){
                cacheKey = $srcSelect.attr('name') + '_' + Arr.implode(selectedValues, '|');
            }
            else {
                cacheKey = $srcSelect.attr('name') + '_' + selectedValues;
            }

            opt.data[$srcSelect.attr('name')] = selectedValues;

            opt = $.extend({}, ajaxOpts, opt);
            if (token != undefined && opt.data.csrfmiddlewaretoken == undefined && token != undefined){
                opt.data.csrfmiddlewaretoken = token;
            }

            function loadOptions(options) {
                if (Typ.isJquery(options)){
                    $targetSelect.empty().append(options);
                }
                else
                {
                    $targetSelect.empty();
                    Slct.addOptions($targetSelect, options);
                }

                Fn.apply(targetUpdated, $targetSelect.get(0), [$targetSelect]);
            }

            if (!noCache && cacheSelectAjaxFilter.hasOwnProperty(cacheKey))
            {
                loadOptions(cacheSelectAjaxFilter[cacheKey]);
                return;
            }

            $.ajax(opt)
                .done(function(data){
                    var options = Str.parseJson(data, false), targetId, targetName, selector, $options, $data;
                    if (options !== false){
                        cacheSelectAjaxFilter[cacheKey] = options;
                        loadOptions(options);
                    }
                    else {
                        $data = $(data);
                        targetId = $targetSelect.attr('id');
                        if (targetId){
                            selector = 'select#' + targetId;
                            $options = $data.find(selector);
                        }

                        targetName = $targetSelect.attr('name');
                        if (targetName && !$options.length){
                            selector = 'select[name="' + targetName + '"]';
                            $options = $data.find(selector);
                        }

                        if ($options.length){
                            cacheSelectAjaxFilter[cacheKey] = $options.children();
                            loadOptions($options.children());
                        }
                        else {
                            BootstrapDialog.alert(errorMessage);
                        }
                    }
                }).fail(function(jqXHR, textStatus, errorThrown){
                    BootstrapDialog.show({
                        title: errorThrown,
                        animate: false,
                        message: errorMessage
                    });
                });
        });

        if (!Slct.getSelectedValues($(targetSelect))){
            $(srcSelect).change();
        }
    };  // End: selectAjaxFilter
    // endregion

    // region [ clearOnEscape ]
    /**
     * Clear the input when the user pressed Escape.
     *
     * @param inputSelector {!selector} - the input selector
     * @param container {!selector|jQuery|HTMLElement|id=} - if you want to use the live event then specify the
     *                                                          outer container
     */
    Patterns.clearOnEscape = function(inputSelector, container){
        var $container = $(container), $input = $(inputSelector), $target;
        function clearOnEscape(e){
            // on escape
            if (e.which == 27){
                $target = $(e.target);
                $target.prop('value', null).val('').change();
            }
        }

        if (container && $container.length){
            $container.on('keyup', inputSelector, clearOnEscape);
        }
        else {
            $input.on('keyup', clearOnEscape);
        }
    };
    // endregion

    // region [ dependencyCheck ]
    /**
     * Check for plugins/lib dependency.
     *
     * @param testObj - if a string then test for jq $.fn, if false display error message then return false.,
     * @param title - title of the error message
     * @param message - the error message
     * @returns {boolean}
     */
    Patterns.dependencyCheck = function (testObj, title, message) {
        // Preference: dialog, toastr, and then last resort => alert
        var result = false;

        if (testObj){
            if ($.type(testObj) == 'string'){
                result = $.fn.hasOwnProperty(testObj);
            }
            else {
                result = true;
            }
        }

        if (result){
            return true;
        }

        if ($.fn.hasOwnProperty('ajaxForm')) {
            BootstrapDialog.show({
                title: title,
                message: message,
                animate: false
            });
        }
        else if (global.toastr != undefined){
            global.toastr.error(message, title);
        }
        else {
            alert(title + "\n" + message);
        }

        return false;
    };
    // endregion

}(typeof window !== 'undefined' ? window : this, jQuery,
    JU.__JU.UI.Patterns, JU.__JU.UI, JU.__JU.Str, JU.__JU.Bs, JU.__JU.Fn, JU.__JU.Utl, JU.__JU.Obj));
/*global jQuery, JU.__JU, Str, Arr, Fn, Ui, gettext, BootstrapDialog */

// REQ: ui-patterns.js, func.js


(function (global, $, Bs) {
    "use strict";

    /**
     * Use BootstrapDialog to display the confirmation box.
     *
     * @param message {string} - the confirmation question
     * @param buttonClicked {function} - function(thisArg:dialog, result:bool) when "Yes" result is true,
     *                                          "No" or "Close" the result is false
     */
    Bs.confirmYesNo = function(message, buttonClicked){
        function invokeButtonClicked(dialog, result) {
            if (buttonClicked != undefined) {
                Fn.apply(buttonClicked, dialog, [result]);
                buttonClicked = null;
                dialog.close();
            }
        }

        BootstrapDialog.show({
            title: gettext('Confirmation'),
            message: message,
            animate: false,
            buttons: [{
                    label: gettext('(N) No'),
                    hotkey: 78, //N
                    action: function(dialog) {
                        invokeButtonClicked(dialog, false);
                    }
                }, {
                    label: gettext('(Y) Yes'),
                    hotkey: 89, //Y
                    cssClass: 'btn-primary',
                    action: function(dialog) {
                        invokeButtonClicked(dialog, true);
                    }
                }],
            onhide: function(dialog){
                invokeButtonClicked(dialog, false);
            }
        });
    };

}(typeof window !== 'undefined' ? window : this, jQuery, JU.__JU.UI.Bs));


/*global */

// STANDALONE: pure js

(function (global) {
    "use strict";

    if (!global.JU.__JU){
        return;
    }

    var populateGlobals = false, forcePush = false;

    // put the libraries into the private object _ju instead of the global namespace
    // eg. Str becomes _ju.Str
    global._ju = {};

    JU.publish(JU.__JU, populateGlobals, forcePush);
    delete JU.__JU;
    JU.activate(global._ju);

}(typeof window !== 'undefined' ? window : this));