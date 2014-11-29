/*global jQuery */

// STANDALONE

var $type = {};

(function($, $type){
    /**
     * Is jQuery object
     * @param o
     * @returns {boolean}
     */
	$type.isJquery = function(o){
		return o instanceof jQuery;
	};

    /**
     * Is js object
     * @param o
     * @returns {boolean}
     */
	$type.isObj = function(o){
		return $.type(o) === 'object';
	};

    /**
     * Is string
     * @param o
     * @returns {boolean}
     */
	$type.isStr = function(o){
		return $.type(o) === 'string';
	};

    /**
     * Is function
     * @param o
     * @returns {boolean}
     */
	$type.isFunc = function(o){
		return $.type(o) === 'function';
	};

    /**
     * Is regex
     * @param o
     * @returns {boolean}
     */
	$type.isRegex = function(o){
		return $.type(o) === 'regexp';
	};

    /**
     * is number
     * @param o
     * @returns {boolean}
     */
	$type.isNum = function(o){
		return $.type(o) === 'number';
	};

    /**
     * Is integer
     * @param o
     * @returns {boolean}
     */
	$type.isInt = function(o){
		return $type.isNumber(o) && o%1 === 0;
	};

    /**
     * Is float
     * @param o
     * @returns {boolean}
     */
	$type.isFloat = function(o){
		return $type.isNumber(o) && !$type.isInt(o);
	};

    /**
     * Is date
     * @param o
     * @returns {boolean}
     */
	$type.isDate = function(o){
		return $.type(o) === 'date';
	};

    /**
     * Is boolean
     * @param o
     * @returns {boolean}
     */
	$type.isBool = function(o){
		return $.type(o) === 'boolean';
	};

    /**
     * Is array
     * @param o
     * @returns {boolean}
     */
	$type.isArray = function(o){
		return $.type(o) == 'array';
	};

    /**
     * Is node
     * @param o
     * @returns {boolean}
     */
    $type.isNode = function(o){
        return typeof Node === "object" ? o instanceof Node :
            o && typeof o === "object" && typeof o.nodeType === "number" && typeof o.nodeName === "string";
    };

    /**
     * Is html element
     * @param o
     * @returns {boolean}
     */
    $type.isElement = function(o){
        return typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
            o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName==="string";
    };
	
}(jQuery, $type));