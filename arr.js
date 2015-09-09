/*global jQuery */

// STANDALONE: jq


(function (global, $) {
    "use strict";

    if (global.Arr == undefined) {
        global.Arr = {};
    }

    (function(Arr){

        /**
         * Is array
         *
         * @param o {object}
         * @returns {boolean}
         */
        Arr.isArray = function(o){
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
         * Split the array into multiple smaller arrays with the specified trunk size length.
         *  eg. [1,2,3,4,5] trunk size 2 => [[1,2], [3,4], [5]]
         *
         * @param arr {!Array}
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

    }(global.Arr));
}(typeof window !== 'undefined' ? window : this, jQuery));