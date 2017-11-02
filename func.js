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