/*global $str: false, $date, jQuery */

// REQ: str-standalone.js, date.js

(function($, $str){
	$str.mtx = [121, 111, 110, 101, 32, 105, 115, 32, 97,
		32, 103, 101, 110, 105, 117, 115, 32, 97, 116, 32, 108, 101, 
		97, 115, 116, 32, 111, 110, 99, 101, 32, 97, 32, 121, 101, 
		97, 114, 46, 32, 84, 104, 101, 32, 114, 101, 97, 108, 32, 103, 
		101, 110, 105, 117, 115, 101, 115, 32, 115, 105, 109, 112, 
		108, 121, 32, 104, 97, 118, 101, 32, 116, 104, 101, 105, 114, 
		32, 98, 114, 105, 103, 104, 116, 32, 105, 100, 101, 97, 115, 
		32, 99, 108, 111, 115, 101, 114, 32, 116, 111, 103, 101, 116, 
		104, 101, 114, 46, 32, 226, 128, 148, 32, 71, 101, 111, 114, 
		103, 32, 67, 104, 114, 105, 115, 116, 111, 112, 104, 32, 76, 
		105, 99, 104, 116, 101, 110, 98, 101, 114, 103, 11];

	/**
	 * Scramble the string to hide from priving eyes
	 * @param {String} s
	 * @param {Number} breakLine - link break length (to avoid long one liner)
	 * @return {String}
	 */	
	$str.fuzzit = function (s, breakLine){
		/*jslint bitwise: true */
		breakLine = $.type(breakLine) === 'undefined' ? breakLine : true;
		
		var r = '', k=s.length, jk=[3,5,8,13,21,34,55,89,144], j=0, 
				sl=k, ch=0, i, c, ml=$str.mtx.length;
		for(i=0; i<s.length; i++,k++){
			c = s.charCodeAt(i) ^ $str.mtx[k%ml];
			r += $str.padLeft(c.toString(16), String.fromCharCode(103), 2);
			ch++;
			if (ch%20===0&&ch!==0&&breakLine){
			r += "\r\n";
			}
			if ((i+sl)%jk[j] === 0){
			r += String.fromCharCode(104+(jk[j]+i+sl)%18);
			j = (j+1)%jk.length;
			ch++;
			if (ch%20===0&&ch!==0&&breakLine){
				r += "\r\n";
			}
			}
		}
		/*jslint bitwise: false */
		return r;
	};

	/**
	 * Decode $str.fuzzit() function
	 * @param {String} s
	 * @return {String}
	 */	
	$str.unfuzzit = function (s){
		/*jslint bitwise: true */
		s = s.replace(/[^0-9a-gA-G]/g, '');
		if (s.length%2 !== 0){
			return 'error';
		}
		var r = '',k=s.length/2, i, c, ml=$str.mtx.length;
		for(i=0; i<s.length; i+=2,k++){
			c = ((s[i]=='g'||s[i]=='G')?'0':s[i])+s[i+1];
			r += String.fromCharCode(parseInt(c, 16) ^ $str.mtx[k%ml]);
		}
		/*jslint bitwise: false */
		return r;
	};

	/**
	 * Base64 encode
	 * @param {String} s
	 * @return {String}
	 */	
	$str.base64Encode = function (s){
		return $.base64.encode(s);
	};

	/**
	 * Base64 decode
	 * @param {String} s
	 * @return {String}
	 */		
	$str.base64Decode = function (s){
		return $.base64.decode(s);
	};

	/**
	 * String to hex
	 * @param {String} s
	 * @return {String}
	 */			
	$str.toHex = function (s){
		var r = '', i;
		for(i=0; i<s.length; i++){
			r += s.charCodeAt(i).toString(16);
		}
		return r;
	};

	/**
	 * Convert hex string into string.
	 * @param {String} s
	 * @return {String}
	 */	
	$str.fromHex = function (hex){
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
	$str.format = function (s){
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
	$str.formatObject = function (o, format){
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
}(window.jQuery, $str));