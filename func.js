/*global jQuery, JU.__JU  */

// STANDALONE: jq


(function (global, $, Fn) {
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
                primaryResult = primaryFunc.apply(thisArgs || this, args);
            trailingFunc.apply(thisArgs || primaryFunc, args);
            return primaryResult;
        };
    };

}(typeof window !== 'undefined' ? window : this, jQuery, JU.__JU.Fn));