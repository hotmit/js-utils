test('$str.subString', function (){
	var txt = "héllố wờrld";
	var data = [
		
	];
	
	equal($str.subString(null), '', 'Null string, return ""');
	equal($str.subString(undefined), '', 'Undefied string, return ""');
	
	equal($str.subString(txt), txt, 'No index, no len, return original');
	
	equal($str.subString(txt, null), txt, 'null index, return original');
	equal($str.subString(txt, undefined), txt, 'undefined index, return original');
	
	equal($str.subString(txt, 3, null), txt.substring(3), 'null len, return sub(index)');
	equal($str.subString(txt, 3, undefined), txt.substring(3), 'undefined len, return sub(index)');
	
	equal($str.subString(txt, 30, null), txt, 'index exceeded input length, return original');
	equal($str.subString(txt, 3, 3000), txt.substring(3), 'len exceeded input length, return sub(index)');
	equal($str.subString(txt, 3000, 3000), txt, 'index and len exceeded input length, return original');
	
	equal($str.subString(txt, 1), txt.substring(1), 'no len');
	equal($str.subString(txt, 1, 3), txt.substring(1, 4), 'index & len');
	
	equal($str.subString(txt, 11, 3), txt.substring(11), 'good index, but len exceeded the string length');
	
	equal($str.subString(txt, -5), txt.substring(txt.length - 5), 'neg index "' + txt.substring(txt.length - 5) + '"');
	equal($str.subString(txt, -5, 2), txt.substring(txt.length - 5, txt.length - 5 + 2), 'neg index with len "' + txt.substring(txt.length - 5, txt.length - 5 + 2) + '"');
	
	equal($str.subString(txt, -5, 300), txt.substring(txt.length - 5), 'neg index with out of bound len "' + txt.substring(txt.length - 5) + '"');

	equal($str.subString(txt, -5, -300), txt.substring(txt.length - 5), 'neg index with out of bound -len "' + txt.substring(txt.length - 5) + '"');
	
	equal($str.subString(txt, -300, 2), txt, 'neg index out of bound, with proper len');
});


test('$str.format', function (){
	var data = {
		name: 'joe',
		age: 27,
		bday: new Date(2000, 9, 27, 3, 20, 20, 999),
		balance: 30.293,
		grade: 0.73
	};

	var array = ['a', 'b', 'c'];
	
	ok(1 in array, 'index in array');
	ok(!('b' in array), 'value NOT in array');
	
	equal($str.format('{0} + {1}', 1, 2), '1 + 2', 'value sub');

	/*
	var a = str.format("hello {0} {1} {0} {0}", "yo", "dude");
	a = str.format("hello {0.name} {0.age}", {name: "john", age: 10});	
	a = str.format("hello {0.1} {0.0}", ["first", "last"]);
	*/
	equal($str.format("hello {0} {1} {0} {0}", "yo", "dude"), 'hello yo dude yo yo', 'sub multiple objects');
	equal($str.format("hello {0.name} {0.age}", data), 'hello joe 27', 'index sub');
	equal($str.format("hello {0.name} {0.age} {0.ink}", data), 'hello joe 27 {0.ink}', 'index sub, index doesn\'t exits');
	equal($str.format("hello {0.1} {0.0}", ["first", "last"]), 'hello last first', 'index numeric property');

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