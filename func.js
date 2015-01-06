/*global jQuery  */

// STANDALONE

var Fn = {};

(function($, Fn){

    /**
     * Similar to function.apply but it checks for undefined function
     *
     * @param func {?function}
     * @param thisArg {object}
     * @param arrArray {Array}
     * @returns {*}
     */
    Fn.apply = function (func, thisArg, arrArray){
        if (func != undefined){
            return func.apply(thisArg, arrArray);
        }
    };

}(jQuery, Fn));