/*global jQuery */

// STANDALONE

// MUST SITS Before $pref
var $arr = {};

(function($, $arr){
	
	/**
	 * Useful when run for IN loop, to determine the key is the property
	 * of that and not something inherited.
	 * @param arr - the array
	 * @param prop - property name/index/key
	 */
	$arr.isProp = function(arr, prop){
		return arr.hasOwnProperty(prop);
	};
	
	/**
	 * Loop through the array and check for the hasOwnProperty() as well.
	 * @param arr - the array
	 * @param func - func(item, asc_key, index) - "this" refer to the arr
	 */
	$arr.each = function(arr, func){
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
	 * @param jqObj - the jQuery list
	 * @param func - func(jqObj, domElm, index) - "this" refer to the jqObj
	 */
	$arr.eachJq = function(jqObj, func){
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

}(jQuery, $arr));