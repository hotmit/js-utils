/*global jQuery */

var $tmr = {};

(function($, $tmr){

    /**
     * Just like setTimeout except it has the argument to override the this instance
     * @param func
     * @param delay - in millisecond
     * @param thisArg
     * @returns {number} - setTimeout instance, use clearTimeout
     */
	$tmr.run = function (func, delay, thisArg){
		return setTimeout(function(){ func.call(thisArg || this); }, delay);
	};
	
}(window.jQuery, $tmr));