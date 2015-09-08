/*global jQuery, setTimeout */

// STANDALONE


(function (global, $) {
    "use strict";

    (function (Tmr) {

        /**
         * Just like setTimeout except it has the argument to override the this instance
         * @param func {function} - "this" is the specified "thisArg"
         * @param delay {number} - in millisecond
         * @param thisArg {object=} - similar to $.proxy, supply "this" for func
         * @returns {number} - setTimeout instance, use clearTimeout
         */
        Tmr.run = function(func, delay, thisArg){
            return setTimeout(function(){ func.call(thisArg || this); }, delay);
        };

    }(global.Tmr));

}(typeof window !== 'undefined' ? window : this, jQuery));
