/*global jQuery  */

// STANDALONE

if (window.Fn === undefined)
{
    window.Fn = {};
}

(function($, Fn){

    /**
     * Similar to function.call but it checks for undefined function
     *
     * @param func {?function} - the function
     * @param thisArg {object}
     * @param argArray {..object} - the arguments objects
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
     * @param argArray {Array}
     * @returns {*}
     */
    Fn.apply = function (func, thisArg, argArray){
        if (func != undefined && $.type(func) === 'function'){
            return func.apply(thisArg, argArray);
        }
    };

    /**
     * Execute a function by name (supports "Obj.sub.runMe")
     * @param funcName {string} - name of the function (supports "Obj.sub.runMe")
     * @param context {object} - pass "window" object to gain access to global object's functions
     * @param argArray {...object}
     * @returns {*}
     */
    Fn.callByName = function(funcName, context, argArray){
        var args = [].slice.call(arguments).splice(2),
            namespaces = funcName.split("."),
            func = namespaces.pop(), i;

        for(i = 0; i < namespaces.length; i++) {
            context = context[namespaces[i]];
        }
        return context[func].apply(context, args);
    };

    /**
     * Execute a function by name (supports "Obj.sub.runMe")
     *
     * @param funcName {string} - name of the function (supports "Obj.sub.runMe")
     * @param context {object} - pass "window" object to gain access to global object's functions
     * @param argArray {Array} - the array of the args
     * @returns {*}
     */
    Fn.applyByName = function(funcName, context, argArray){
        var namespaces = funcName.split("."),
            func = namespaces.pop(), i;
        for(i = 0; i < namespaces.length; i++) {
            context = context[namespaces[i]];
        }
        return context[func].apply(context, argArray);
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



}(jQuery, window.Fn));