/*global jQuery, Node, HTMLElement */

// STANDALONE

if (typeof window.Tp === 'undefined')
{
    window.Tp = {};
}

(function($, Tp){
    /**
     * Is jQuery object
     * @param o
     * @returns {boolean}
     */
	Tp.isJquery = function(o){
		return o instanceof jQuery;
	};

    /**
     * Is js object
     * @param o
     * @returns {boolean}
     */
	Tp.isObj = function(o){
		return $.type(o) === 'object';
	};

    /**
     * Is string
     * @param o
     * @returns {boolean}
     */
	Tp.isStr = function(o){
		return $.type(o) === 'string';
	};

    /**
     * Is function
     * @param o
     * @returns {boolean}
     */
	Tp.isFunc = function(o){
		return $.type(o) === 'function';
	};

    /**
     * Is regex
     * @param o
     * @returns {boolean}
     */
	Tp.isRegex = function(o){
		return $.type(o) === 'regexp';
	};

    /**
     * Is number
     * @param o
     * @returns {boolean}
     */
	Tp.isNumber = function(o){
		return $.type(o) === 'number';
	};

    /**
     * Is integer
     * @param o
     * @returns {boolean}
     */
	Tp.isInt = function(o){
		return Tp.isNumber(o) && o%1 === 0;
	};

    /**
     * Is float
     * @param o
     * @returns {boolean}
     */
	Tp.isFloat = function(o){
		return Tp.isNumber(o) && !Tp.isInt(o);
	};

    /**
     * Is date
     * @param o
     * @returns {boolean}
     */
	Tp.isDate = function(o){
		return $.type(o) === 'date';
	};

    /**
     * Is boolean
     * @param o
     * @returns {boolean}
     */
	Tp.isBool = function(o){
		return $.type(o) === 'boolean';
	};

    /**
     * Is array
     * @param o
     * @returns {boolean}
     */
	Tp.isArray = function(o){
		return $.type(o) == 'array';
	};

    /**
     * Is node
     * @param o
     * @returns {boolean}
     */
    Tp.isNode = function(o){
        return typeof Node === "object" ? o instanceof Node :
            o && typeof o === "object" && typeof o.nodeType === "number" && typeof o.nodeName === "string";
    };

    /**
     * Is html element
     * @param o
     * @returns {boolean}
     */
    Tp.isElement = function(o){
        return typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
            o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName==="string";
    };
	
}(jQuery, window.Tp));