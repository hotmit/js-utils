/*global jQuery, setTimeout */

// STANDALONE

var Tmr = {};

(function($, Tmr){

    /**
     * Just like setTimeout except it has the argument to override the this instance
     * @param {function} func - "this" is the specified "thisArg"
     * @param {number} delay - in millisecond
     * @param {object=} thisArg - similar to $.proxy, supply "this" for func
     * @returns {number} - setTimeout instance, use clearTimeout
     */
	Tmr.run = function(func, delay, thisArg){
		return setTimeout(function(){ func.call(thisArg || this); }, delay);
	};
	
}(jQuery, Tmr));