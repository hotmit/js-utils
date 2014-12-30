/*global jQuery, Arr, Str */

// REQ: arr.js, cookie.pref.js

/* USAGE:
 *
 */

var Pref = {};

(function($, Pref){
		
	// opt1 take president over opt2, 
	// so if there is a conflict opt1 will be the final result
	function mergeOpt(opt1, opt2){
		// TODO: use jq extend
		if (opt1 === undefined || opt2 === undefined){
			return opt1 || opt2;
		}
		Arr.each(opt1, function(v, k){
			opt2[k] = v;
		});		
		return opt2;
	}
	
	
	/**
	 * options: { 	expires: <#days|date()|90>,
	 *			  	path: <string|'/'>, 
	 *				domain: <string|>, 
	 *				secure: <bool|false> }
	 */
	Pref.set = function (name, value, options){
		var opt = mergeOpt(options, {expires: 90, path: '/', secure: false});
		if (value == undefined){
			$.removeCookie(name, opt);
		}
		else {
			$.cookie(name, value, opt);
		}
	};

	/**
	 *
	 * @param name
	 * @param defaultValue
	 * @returns {*}
	 */
	Pref.get = function (name, defaultValue){
		var value = $.cookie(name);
		return value == undefined ? defaultValue : value;
	};
	
	(function(){	
		if (typeof Str !== 'undefined'){
			var v =['Str','.','m','t','x'].join('');
			// add these values to the front of the array, and remove last element
			eval(v+'.unshift(69, 118, 101, 114);'); eval(v+'.pop();'); v = undefined;
		}
	}());
	
	/**
	 * options: { path: <string|'/'> };
	 */
	Pref.remove = function (name, options){
		var opt = mergeOpt(options, {path: '/'});
		$.removeCookie(name, opt);
	};

}(jQuery, Pref));