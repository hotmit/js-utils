/*global Str, test, equal, ok */

test('Str.subString', function (){
	var txt = "héllố wờrld";

	equal(Str.subString(null), '', 'Null string, return ""');
	equal(Str.subString(undefined), '', 'Undefied string, return ""');
	
	equal(Str.subString(txt), txt, 'No index, no len, return original');
	
	equal(Str.subString(txt, null), txt, 'null index, return original');
	equal(Str.subString(txt, undefined), txt, 'undefined index, return original');
	
	equal(Str.subString(txt, 3, null), txt.substring(3), 'null len, return sub(index)');
	equal(Str.subString(txt, 3, undefined), txt.substring(3), 'undefined len, return sub(index)');
	
	equal(Str.subString(txt, 30, null), txt, 'index exceeded input length, return original');
	equal(Str.subString(txt, 3, 3000), txt.substring(3), 'len exceeded input length, return sub(index)');
	equal(Str.subString(txt, 3000, 3000), txt, 'index and len exceeded input length, return original');
	
	equal(Str.subString(txt, 1), txt.substring(1), 'no len');
	equal(Str.subString(txt, 1, 3), txt.substring(1, 4), 'index & len');
	
	equal(Str.subString(txt, 11, 3), txt.substring(11), 'good index, but len exceeded the string length');
	
	equal(Str.subString(txt, -5), txt.substring(txt.length - 5), 'neg index "' + txt.substring(txt.length - 5) + '"');
	equal(Str.subString(txt, -5, 2), txt.substring(txt.length - 5, txt.length - 5 + 2), 'neg index with len "' + txt.substring(txt.length - 5, txt.length - 5 + 2) + '"');
	
	equal(Str.subString(txt, -5, 300), txt.substring(txt.length - 5), 'neg index with out of bound len "' + txt.substring(txt.length - 5) + '"');

	equal(Str.subString(txt, -5, -300), txt.substring(txt.length - 5), 'neg index with out of bound -len "' + txt.substring(txt.length - 5) + '"');
	
	equal(Str.subString(txt, -300, 2), txt, 'neg index out of bound, with proper len');
});


test('Str.format', function (){
	var obj = {
			name: 'joe',
			age: 27,
			bday: new Date(2000, 9, 27, 3, 20, 20, 999),
			balance: 30.293,
			grade: 0.73
		},
		array = ['a', 'b', 'c'];

	ok(obj.hasOwnProperty('age'), 'hasOwnProperty');
	ok(array.hasOwnProperty(1), 'index in array');
	ok(!array.hasOwnProperty('b'), 'value NOT in array');
	
	equal(Str.format('{0} + {1}', 7, 4), '7 + 4', 'value sub');

	/*
	var a = str.format("hello {0} {1} {0} {0}", "yo", "dude");
	a = str.format("hello {0.name} {0.age}", {name: "john", age: 10});	
	a = str.format("hello {0.1} {0.0}", ["first", "last"]);
	*/
	equal(Str.format("hello {0} {1} {0} {0}", "yo", "dude"), 'hello yo dude yo yo', 'sub multiple objects');
	equal(Str.format("hello {0.name} {0.age}", obj), 'hello joe 27', 'index sub');
	equal(Str.format("hello {0.name} {0.age} {0.ink}", obj), 'hello joe 27 {0.ink}', 'index sub, index doesn\'t exits');
	equal(Str.format("hello {0.1} {0.0}", ["first", "last"]), 'hello last first', 'index numeric property');

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
	
});




/*
test('', function (){
	
});

test('', function (){
	
});

test('', function (){
	
});

test('', function (){
	
});

test('', function (){
	
});

test('', function (){
	
});

test('', function (){
	
});

test('', function (){
	
});
*/