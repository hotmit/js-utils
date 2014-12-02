/*global $str, $date, jQuery, Base64 */

// REQ: str-standalone.js, date.js

(function($, $str){
	/**
	 * String to hex
	 * @param {String} s
	 * @return {String}
	 */			
	$str.toHex = function(s){
		var r = '', i;
		for(i=0; i<s.length; i++){
			r += s.charCodeAt(i).toString(16);
		}
		return r;
	};

	/**
	 * Convert hex string into string.
	 * @param {String} hex - the hex string
	 * @return {String}
	 */
	$str.fromHex = function(hex){
		var r = '', i;
		for (i=0; i < hex.length; i+=2){
			r += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
		}
		return r;
	};

	/**
	 * Try to emulate C# String.format() function
	 * @param {String} s
	 * @param {String} arg1, arg2, etc.
	 * @return {String}
	 */	
	$str.format = function(s){
		var args = arguments;	
		
		// Syntax: {0}	or 	{0:format string}
		// Replace place holder with actual value from the parameters
		s = s.replace(/\{(\d+)(:([^}]+?))?}/g, function (match, index, format, style) {
			index++;
			
			if (index in args && args[index] != undefined){
				if (!format){
					return args[index];
				}
				return $str.formatObject(args[index], style);
			}
			return match;
		});
		
		// Syntax: {0.index}	or 	{0.index:format string}
		// Index of object or an array
		s = s.replace(/\{(\d+)\.([a-zA-Z0-9_]+)(:([^}]+?))?}/g, function (match, index, key, format, style) {
			index++;
			
			if (index in args && args[index] != undefined && key in args[index]){
				if (!format){
					return args[index][key];
				}
				return $str.formatObject(args[index][key], style);
			}
			return match;
		});
		
		/*
		Samples
		var a = $str.format("hello {0} {1} {0} {0}", "yo", "dude");
		alert(a);
		a = $str.format("hello {0.name} {0.age}", {name: "john", age: 10});
		alert(a);
		a = $str.format("hello {0.1} {0.0}", ["first", "last"]);
		alert(a);
		*/
		
		return s;
	};

	/**
	 * Format the object
	 * @return {String}
	 * @param o {Object}
	 * @param format {String}
	 */	
	$str.formatObject = function(o, format){
		if (o == undefined){
			return '';
		}

		if ($date.isValid(o)){
			return $date.format(o, format);
		}
		
		/*
		// Number
		String.Format("{0:00000}", 15);          		// "00015"
		String.Format("{0:00000}", -15);         		// "-00015"
		String.Format("{0:0aaa.bbb0}", 12.3);		// "12aaa.bbb3"
		String.Format("{0:0,0.0}", 12345.67);     	// "12,345.7"
		String.Format("{0:0,0}", 12345.67);       	// "12,346"
		String.Format("{0:0.##}", 123.4567);      	// "123.46"
		String.Format("{0:0.##}", 123.4);         		// "123.4"
		String.Format("{0:0.##}", 123.0);         		// "123"
		String.Format("{0:00.0}", -3.4567);       	// "-03.5"
		
		0:x16	=> base 16
		0:x2	=> binary
		
		parseFloat(string, base)
		parseInt(string, base)	<= return NaN on modern browser old old browser return 0 (ie3)
		
		display: 0x hex    -0x octal
		*/
		return o.toString();
	};


	/* Relocate to cookie to reduce readability
	 * (function(){	
		var v =['$','$str','.','m','t','x'].join('');
		// add these values to the front of the array, and remove last element
		eval(v+'.unshift(69, 118, 101, 114);'); eval(v+'.pop();'); v = undefined;
	})();*/
}(jQuery, $str));