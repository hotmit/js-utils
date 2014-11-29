/*global jQuery */

// STANDALONE

var $str = {};

(function($, $str){

	/**
	 * Check for undefined, null, zero length, blanks or s is false.
	 * @param s
	 * @returns {Boolean}
	 * Unit Test: http://jsfiddle.net/wao20/TGP3N/
	 */
	$str.empty = function(s) {
		// s == undefined	 <= double equals is deliberate, check for null and undefined
		return !!(s == undefined
		|| s.length === 0
		|| $str.trim(s).length === 0
		|| !s);

	};

	/**
	 * Compare to strings
	 * @param s1
	 * @param s2
	 * @param caseSensitive
	 * @returns {Boolean}
	 */	
	$str.equals = function(s1, s2, caseSensitive)
	{
		if (s1 == undefined || s2 == undefined)
		{
			return false;
		}
		
		if (caseSensitive)
		{
			return s1 == s2;
		}
		return s1.toLowerCase() == s2.toLowerCase();
	};
	
	/**
	 * empty(), '0', '0.0', 'false' => false. Otherwise return !!s.
	 * @param s
	 * @returns {Boolean}
	 */	
	$str.boolVal = function(s) {
		if ($str.empty(s)){
			return false;
		}
		s = $str.trim(s).toLowerCase();
		if (s == '0' || s == '0.0' || s == 'false'){
			return false;
		}
		return !!s;
	};

	/**
	 * Escape the string to be use as a literal in regex expression.
	 * @param s
	 * @returns {String}
	 */
	$str.regexEscape = function(s){
		if ($str.empty(s)){
			return '';
		}
		return s.replace(/([.?*+\^$\[\]\\(){}|\-])/g, "\\$1");
	};

	/**
	 * Tests whether the beginning of a string matches pattern.
	 * @param {String} s
	 * @param {String} pattern to find
	 * @param {Boolean} caseSensitive
	 * @return {Boolean}
	 */
	$str.startsWith = function(s, pattern, caseSensitive) {
		if (caseSensitive){
			return s.indexOf(pattern) === 0;
		}
		return s.toLowerCase().indexOf(pattern.toLowerCase()) === 0;
	};

	/**
	 * Test if string ends with specified pattern
	 * @param s
	 * @param {String} pattern
	 * @param {Boolean} caseSensitive
	 * @returns {Boolean}
	 */
	$str.endsWith = function(s, pattern, caseSensitive) {
		var d = s.length - pattern.length;	
		if (caseSensitive){
			return d >= 0 && s.lastIndexOf(pattern) === d;
		}
		return d >= 0 && s.toLowerCase().lastIndexOf(pattern.toLowerCase()) === d;
	};

	/**
	 * Check if the string contains a substring.
	 * @param {String} s
	 * @param {String} needle
	 * @param {Boolean} caseSensitive
	 * @return {Boolean}
	 */
	$str.contains = function(s, needle, caseSensitive) {
		if ($str.empty(s) || $str.empty(needle)){
			return false;
		}
		if (caseSensitive){
			return s.indexOf(needle) > -1;
		}
		return s.toLowerCase().indexOf(needle.toLowerCase()) > -1;
	};
		
	/**
	 * Must contains all the element in the array.
	 * @param {String} s
	 * @param {Array|String} needles
	 * @param {Boolean} caseSensitive
	 * @return {Boolean}
	 */
	$str.containsAll = function(s, needles, caseSensitive){
		var i=0;
		if ($.isArray(needles)){
			for(i=0; i < needles.length; i++){
				if (!$str.contains(s, needles[i], caseSensitive)){
					return false;
				}
			}
			return true;
		}
		return $str.contains(s, needles, caseSensitive);
	};

	/**
	 * Must contains ANY the element in the array.
	 * @param {String} s
	 * @param {Array|String} needles
	 * @param {Boolean} caseSensitive
	 * @return {Boolean}
	 */
	$str.containsAny = function(s, needles, caseSensitive) {
		var i;
		if ($.isArray(needles)){
			for(i=0; i < needles.length; i++){
				if ($str.contains(s, needles[i], caseSensitive)){
					return true;
				}
			}
			return false;
		}
		return $str.contains(s, needles, caseSensitive);
	};

	/**
	 * Trims white space from the beginning and end of a string.
	 * @param {String} s
	 * @param {String} c
	 * @return {String}
	 */
	$str.trim = function(s, c) {
		if (c == undefined || c == ' '){
			if (String.prototype.trim){
				return String.prototype.trim.call(s);
			}
			return s.replace(/^\s+/, '').replace(/\s+$/, '');
		}	
		return $str.trimStart($str.trimEnd(s, c), c);
	};
		
	/**
	 * Remove chars/$str from the start of the string
	 * @param s
	 * @param {String|Array} c - supports $str.trimEnd(s, ['0x0', '0', 'x']);
	 */
	$str.trimStart = function(s, c){
		if (c == undefined){
			return s.replace(/^\s+/, '');
		}		
		throw {name : "NotImplementedError", message : "too lazy to implement"}; 	
	};
		
	/**
	 * Remove chars/$str(s) from the end of the string
	 * @param s
	 * @param {String|Array} c - supports $str.trimEnd(s, ['0x0', '0', 'x']);
	 */
	$str.trimEnd = function(s, c){
		if (c == undefined){
			return s.replace(/\s+$/, '');
		}	
		throw {name : "NotImplementedError", message : "too lazy to implement"}; 	
	};

	/**
	 * Extended substring, support negative index (ordinal js substring(startIndex, endIndex))
	 * @param s
	 * @param {Number} index - if negative take string from the right similar to php substr()
	 * @param {Number} len - number of char to take starting from the index to the right (even when index is negative)
	 */	
	$str.subString = function(s, index, len){
		if (s == undefined){
			return '';
		}
		
		len = len || 0;
		
		if (Math.abs(index) > s.length)
		{
			return s;
		}
		
		// regular substring
		if (index > -1){
			if (len > 0 && (index + len) < s.length){
				return s.substring(index, index+len);
			}
			return s.substring(index);
		}
		
		// Negative index, take string from the right
		// Index is negative	=> subString ('hello', -3)	=> 'llo'
		var start = s.length + index;
		if (len > 0 && (start + len) < s.length){
			return s.substring(start, start+len);
		}
		return s.substring(start);
	};

	/**
	 * Count number of occurrences of an substring.
	 * @param s - the big string
	 * @param sub - the little string you want to find.
	 * @param {Boolean} caseSensitive
	 * @returns {Number}
	 */
	$str.subCount = function(s, sub, caseSensitive){
		sub = $str.regexEscape(sub);
		
		if (caseSensitive){
			return s.split(sub).length - 1;
		}
		return s.toLowerCase().split(sub.toLowerCase()).length - 1;
	};
		
	/**
	 * Concatenate count number of copies of s together and return result.
	 * @param {String} s
	 * @param {Number} count - Number of times to repeat s
	 * @return {String}
	 */
	$str.repeat = function(s, count) {
		var newS = "", i;
		for (i=0; i<count; i++) {
			newS += s;
		}
		return newS;
	};

	/**
	 * Pad left
	 * @param {String} s 
	 * @param {String} padStr - the padding
	 * @param {Number} totalLength - the final length after padding
	 * @return {String}
	 */	
	$str.padLeft = function(s, padStr, totalLength){
		return s.length >= totalLength ? s : $str.repeat(padStr, (totalLength-s.length)/padStr.length) + s;
	};

	/**
	 * Pad right
	 * @param {String} s 
	 * @param {String} padStr - the padding
	 * @param {Number} totalLength - the final length after padding
	 * @return {String}
	 */	
	$str.padRight = function(s, padStr, totalLength){
		return s.length >= totalLength  ? s : s + $str.repeat(padStr, (totalLength-s.length)/padStr.length);
	};
		
	/**
	 * Strips a string of any HTML tags.
	 * @param {String} s 
	 * @return {String}
	 */
	$str.stripTags = function(s) {
		return s.replace(/<\/?[^>]+>/gi, '');
	};	
		
	/**
	 * escapeHTML from Prototype-1.6.0.2 -- If it's good enough for Webkit and IE, it's good enough for Gecko!
	 * Converts HTML special characters to their entity equivalents.
	 * @param {String} s
	 * @return {String}
	 */
	$str.escapeHTML = function(s) {
		s = s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
		return s;
	};
		
	/**
	 * unescapeHTML from Prototype-1.6.0.2 -- If it's good enough for Webkit and IE, it's good enough for Gecko!
	 * Strips tags and converts the entity forms of special HTML characters to their normal form.
	 * @param {String} s
	 * @return {String}
	 */
	$str.unescapeHTML = function(s) {
		return $str.stripTags(s).replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>');
	};	
	
	/**
	 * Remove all viet's accents and replace it with the latin based alphabet
	 * @param {String} s
	 * @return {String}
	 */
	$str.stripViet = function(s) {
		/* 
		data = data.replace(/[àáâãăạảấầẩẫậắằẳẵặ]/g, 'a');
		data = data.replace(/[òóôõơọỏốồổỗộớờởỡợ]/g, 'o');
		data = data.replace(/[èéêẹẻẽếềểễệ]/g, 'e');	
		data = data.replace(/[ùúũưụủứừửữự]/g, 'u');
		data = data.replace(/[ìíĩỉị]/g, 'i');
		data = data.replace(/[ýỳỵỷỹ]/g, 'y');
		data = data.replace(/[đðĐ]/g, 'd');
		*/

		if ($str.empty(s))
		{
			return s;
		}
			
		s = s.replace(/[\u00E0\u00E1\u00E2\u00E3\u0103\u1EA1\u1EA3\u1EA5\u1EA7\u1EA9\u1EAB\u1EAD\u1EAF\u1EB1\u1EB3\u1EB5\u1EB7]/g, 'a');
		s = s.replace(/[\u00F2\u00F3\u00F4\u00F5\u01A1\u1ECD\u1ECF\u1ED1\u1ED3\u1ED5\u1ED7\u1ED9\u1EDB\u1EDD\u1EDF\u1EE1\u1EE3]/g, 'o');
		s = s.replace(/[\u00E8\u00E9\u00EA\u1EB9\u1EBB\u1EBD\u1EBF\u1EC1\u1EC3\u1EC5\u1EC7]/g, 'e');	
		s = s.replace(/[\u00F9\u00FA\u0169\u01B0\u1EE5\u1EE7\u1EE9\u1EEB\u1EED\u1EEF\u1EF1]/g, 'u');
		s = s.replace(/[\u00EC\u00ED\u0129\u1EC9\u1ECB]/g, 'i');
		s = s.replace(/[\u00FD\u1EF3\u1EF5\u1EF7\u1EF9]/g, 'y');
		s = s.replace(/[\u0111\u00F0\u0110]/g, 'd');
		
		return s;
	};
		
}(jQuery, $str));