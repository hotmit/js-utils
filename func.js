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

    /**
     * Combine multiple functions together to run at once,
     * all functions must have the same parameters.
     *
     * @param thisArg {object}
     * @param arrArray {Array} - pass the arguments of the previous function
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

}(jQuery, Fn));