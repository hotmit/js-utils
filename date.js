/*global jQuery */

// STANDALONE

/**
	// Source: http://www.php.net/manual/en/function.date.php

	// Day
	d	01 to 31
	D	Mon through Sun
	j	1-31
	l (lowercase 'L')	Sunday through Saturday
			N print number 1 (for Monday) through 7 (for Sunday) (Not implemented)
	N	Ngay bang Tieng Viet => Thu Hai - Chua Nhat (Dup, Non Standard)
	S  day of month st, nd, rd, th  (Not implemented)
			w print number 1 (for Monday) through 7 (for Sunday) (Not implemented)
			z day of year  (Not implemented)
			W week number in the year
			
	// Month
	F	January through December
	m	01 through 12
	M	Jan through Dec
	n	1 through 12
	T	Thang bang Tieng Viet => Thang Mot - Thang Muoi Hai (Non Standard)
		t total number of days in the month  28 through 31 (Not implemented)

	// Year
	Y	1999 or 2003
	y	99 or 03
			L 1 if it is a leap year, 0 otherwise. (Not implemented)
						
	// Time
	a	am or pm
	A	AM or PM
	g	1 through 12	hour/12
	G	0 through 23	hour/24
	h	01 through 12	pad hour/12
	H	00 through 23	pad hour/24
	i	00 to 59		pad minute
	s	00 to 59		pad second

	// Time Zone
	O	+0200 	<= utc + 2hours
	P	+02:00

	// Time
	c	2004-02-12 15:19:21+00:00	php=2004-02-12T15:19:21+00:00
	r	Thu, 21 Dec 2000 16:01:07 +0200
	q	2001-03-10 17:16:18	Y-m-d H:i:s	mysql date  (Non Standard)
	o	2004-02-12		Y-m-d  (Dup, Non Standard)
	t	5:34pm			g:ia  (Dup, Non Standard)
*/
var Dt = {};

(function($, Dt){

	var _dayShort 	= ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
		_dayLong 	= ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
		_dayViet 	= ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chúa Nhật'],		
		_monthShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
		_monthLong 	= ['January', 'February', 'March', 'April', 'May', 'June', 
					 'July', 'August', 'September', 'October', 'November', 'December'];
	
	/**
	 * Get a array of all the parts of a date. (N for viet day)
	 * @param {!object} d - the date object.
	 * @returns {Array}
	 */
	Dt.getDateParts = function(d){
		var o = {}, j = d.getDate(),
			w = d.getDay(), GG = d.getHours(),
			n = d.getMonth(), Y = d.getFullYear(),
		
			// 12 hour format
			g = GG <= 12 ? GG : GG - 12,
			tz = d.getTimezoneOffset() / 60,
			tzSign = tz < 0 ? '-' : '+';

		g = g == 0 ? 12 : g;
		
		// timezone
		tz = Math.abs(tz);
		
		o.d = Dt.padZero(j);
		o.D = _dayShort[w];
		o.j = j;
		o.l = _dayLong[w];
		o.N = _dayViet[w];
		
		o.F = _monthLong[n];
		o.m = Dt.padZero(n+1);
		o.M = _monthShort[n];
		o.n = n+1;
		o.T = 'Tháng ' + (n+1);
		
		o.Y = Y;
		o.y = Y.toString().substring(2);
		
		o.a = GG < 12 ? 'am' : 'pm';
		o.A = GG < 12 ? 'AM' : 'PM';
		o.g = g;
		o.G = GG;
		o.h = Dt.padZero(g);
		o.H = Dt.padZero(GG);
		o.i = Dt.padZero(d.getMinutes());
		o.s = Dt.padZero(d.getSeconds());
		
		o.O = tzSign + Dt.padZero(tz) + '00';
		o.P = tzSign + Dt.padZero(tz) + ':00';
		
		o.c = o.Y+'-'+o.m+'-'+o.d+' '+o.H+':'+o.i+':'+o.s+o.P;
		o.r = o.D+', '+o.j+' '+o.M+' '+o.Y+' '+o.H+':'+o.i+':'+o.s+' '+o.O;
		o.q = o.Y+'-'+o.m+'-'+o.d+' '+o.H+':'+o.i+':'+o.s;
		o.o = o.Y+'-'+o.m+'-'+o.d;
		o.t = o.g+':'+o.i+o.a;
		
		return o;
	};
	
	/***
	 * Get the utc equivalent of getDateParts().
	 * @param {date} d - the local date time.
	 */
	Dt.getUtcParts = function(d){
		var utc = Dt.toUtc(d),
			o = Dt.getDateParts(utc);

		o.O = '+0000';
		o.P = '+00:00';
		o.c = o.c.substring(0, 19) + o.O;
		o.r = o.r.substring(0, 26) + o.P;
		
		return o;
	};
	
	/***
	 * Convert to utc, but the getTimezoneOffset() is not zero, but the date and time is utc.
	 * @param {date} d - local date object
	 */
	Dt.toUtc = function(d)
	{
		// convert minute into ms
		var offset = d.getTimezoneOffset() * 60000;
		return new Date(d.getTime() + offset);
	};
	
	/***
	 * Two dates has the same year, month and day.
	 * @param {date} d1 - date object
	 * @param {date} d2 - date object
	 * @returns {boolean}
	 */
	Dt.isSameDate = function(d1, d2)
	{
		return  d1.getFullYear() == d2.getFullYear()
				&& d1.getMonth() == d2.getMonth()
				&&  d1.getDate() == d2.getDate();
	};
	/***
	 * Two dates has the same year, month and day.
	 * @param {number} e1 - milliseconds since 1970 (unix epoch). Note php time() is in seconds not milliseconds.
	 * @param {number} e2 - milliseconds since 1970 (unix epoch). Note php time() is in seconds notmillisecondss.
	 * @returns {boolean}
	 */		
	Dt.epochSameDate = function(e1, e2){
		var d1 = new Date(e1),
			d2 = new Date(e2);
		
		return Dt.isSameDate(d1, d2);
	};
	
	/**
	 * Add a zero to the front if it is a single digit.
	 * @param {number|string} s - the number or string.
	 * @returns {String}
	 */
	Dt.padZero = function(s){
		s = s.toString();
		return s.length == 2 ? s : '0' + s;
	};
	
	/***
	 * Is Date data type
	 * @param {object} o - the object to test.
	 * @returns {boolean}
	 */
	Dt.isDate = function(o){
		return Object.prototype.toString.call(o) === "[object Date]";
	};
	
	/***
	 * Test to see if the date is valid. Usually it bad date
	 * when the string use to create the date object is bad (ie not valid date format).
	 * Example: new Date("hello world"); 
	 * @param {date} d - the date object
	 * @returns {boolean}
	 */
	Dt.isValid = function(d){
		if (Dt.isDate(d)){
			// d = new Date("junk") => d.getTime() return NaN 
			return !isNaN(d.getTime());
		}
		return false;
	};
	
	/***
	 * Format date according to the format string.
	 * @param {date} d - date
	 * @param {string} format - format string, for format look up php date() (this function doesn't support all format)
	 * MAKE SURE to double escape the backslash ie if you want to escape a letter 'h' => '\\h'
	 * @return {string}
	 */
	Dt.format = function(d, format){
		if (!Dt.isValid(d)){
			return format;
		}

		var p = Dt.getDateParts(d),
			result = format.replace(/(\\?)([dDjlNFmMnTYyaAgGhHisOPcrqot])/g, function (whole, slash, key){
						// no slash
						if (!slash){
							return p[key];
						}

						// if slash exist ie this is an escaped char 
						// return just the letter as a literal
						return key;
					});
		
		// remove any unnecessary backslashes
		result = result.replace(/\\([a-z])/gi, '$1');
		
		return result;
	};
	
}(jQuery, Dt));