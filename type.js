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


