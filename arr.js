/*global jQuery, JU.__JU, Str */

// REQ: jq, str

(function (global, $, Arr, Str) {
    "use strict";

    /**
     * Is array
     *
     * @param o {object}
     * @returns {boolean}
     */
    Arr.isArray = function(o){
        if (Array.isArray){
            return Array.isArray(o);
        }
        return $.type(o) == 'array';
    };

    /**
     * Useful when run for IN loop, to determine the key is the property
     * of that and not something inherited.
     *
     * @param arr {Array} - the array
     * @param prop {string} - property name/index/key
     * @return {boolean}
     */
    Arr.isProp = function(arr, prop){
        return arr.hasOwnProperty(prop);
    };

    /**
     * Loop through the array and check for the hasOwnProperty() as well.
     *
     * @param arr {Array} - the array
     * @param func {function(this:Array, item, asc_key:string, index:number):boolean}
     * 		- "this" refer to the arr, return false to break the loop
     */
    Arr.each = function(arr, func){
        var i=0, k, r;
        for(k in arr){
            if (arr.hasOwnProperty(k)){
                r = func.call(arr, arr[k], k, i);

                if (r === false){
                    break;
                }
                i++;
            }
        }
    };

    /**
     * Loop through the list of jQuery objects.
     *
     * @param jqObj {jQuery} - the jQuery list
     * @param func {function(this:jQuery, jqElm:jQuery, domElm:HTMLElement, index:number):boolean}
     * 		- "this" refer to the jqObj collection, return false to break the loop
     */
    Arr.eachJq = function(jqObj, func){
        var i, r, len;
        if (jqObj == undefined || !(jqObj instanceof jQuery)){
            return null;
        }

        for(i=0, len=jqObj.length; i<len; i++){
            r = func.call(jqObj, jqObj.eq(i), jqObj.get(i), i);

            if (r === false){
                break;
            }
        }
    };

    /**
     * Create an array out of a range of number.
     * eg. range(10) 	=> [0,2 .. 8, 9] len==10
     *     range(1,3) 	=> [1,2]
     *     range(1,7,2)	=> [1,3,5]
     *
     * @param start {!number}
     * @param end {?number=} - non-inclusive
     * @param step {?number=}
     * @return {Array}
     */
    Arr.range = function (start, end, step) {
        if (end == undefined){
            end = start;
            start = 0;
        }

        if (step == undefined){
            step = 1;
        }

        var arr = [], val=start;
        while(val<end){
            arr.push(val);
            val+= step;
        }

        return arr;
    };

    /**
     * Join the array together to make a string.
     *
     * @param arr {!Array<string>}
     * @param glue {string=}
     */
    Arr.implode = function(arr, glue){
        glue = glue == undefined ? ', ' : glue;
        return arr.join(glue);
    };

    /**
     * Split the array into multiple smaller arrays with the specified trunk size length (modify arr).
     *  eg. [1,2,3,4,5] trunk size 2 => [[1,2], [3,4], [5]]
     *
     * @param arr {!Array} - this array will be emptied at the end.
     * @param chunkSize {number}
     * @returns {Array<Array>}
     */
    Arr.chop = function(arr, chunkSize){
        var result = [], chunk;
        while(arr.length){
            chunk = arr.splice(0, chunkSize);
            result.push(chunk);
        }
        return result;
    };

    /**
     * Split arr into chunks (leave arr intact)
     *
     * @param arr {!Array}
     * @param chunkSize {number}
     * @returns {Array}
     */
    Arr.chunks = function (arr, chunkSize) {
        var result = [];
        for (var i=0, len=arr.length; i<len; i+=chunkSize)
            result.push(arr.slice(i, i+chunkSize));
        return result;
    };

    /**
     * Remove any emptied items in the array
     *
     * @param arr {Array} - the array to trim
     * @param callback {?function} - optional test function(element), return true to keep the item.
     * @returns {Array}
     */
    Arr.trim = function(arr, callback){
        var i, result = [];
        if (!arr){
            return result;
        }
        callback = callback || function(elm){
                return !Str.empty(elm);
            };
        for(i=0; i<arr.length; i++){
            var itm = arr[i];
            if (callback.call(itm, itm)){
                result.push(itm);
            }
        }
        return result;
    };
}(typeof window !== 'undefined' ? window : this, jQuery, JU.__JU.Arr, JU.__JU.Str));