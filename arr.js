/*global jQuery */

// STANDALONE

// MUST SITS Before Pref
var Arr = {};

(function($, Arr){
	
	/**
	 * Useful when run for IN loop, to determine the key is the property
	 * of that and not something inherited.
	 * @param {array} arr - the array
	 * @param prop - property name/index/key
	 * @return {boolean}
	 */
	Arr.isProp = function(arr, prop){
		return arr.hasOwnProperty(prop);
	};
	
	/**
	 * Loop through the array and check for the hasOwnProperty() as well.
	 * @param {array} arr - the array
	 * @param {function(this:Array, item, asc_key:string, index:number):boolean} func
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
	 * @param {jQuery} jqObj - the jQuery list
	 * @param {function(this:jQuery, jqElm:jQuery, domElm:HTMLElement, index:number):boolean} func
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
	 * @param {!number} start
	 * @param {?number=} end - non-inclusive
	 * @param {?number=} step
	 * @return {array}
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

}(jQuery, Arr));