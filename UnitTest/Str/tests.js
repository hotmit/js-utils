/*global QUnit, Str, test, equal, ok */


QUnit.test('Str - Str.subStr', function (assert){
	var txt = "héllố wờrld";

	assert.equal(Str.subStr(null), '', 'Null string, return ""');
	assert.equal(Str.subStr(undefined), '', 'Undefied string, return ""');
	
	assert.equal(Str.subStr(txt), txt, 'No index, no len, return original');
	
	assert.equal(Str.subStr(txt, null), txt, 'null index, return original');
	assert.equal(Str.subStr(txt, undefined), txt, 'undefined index, return original');
	
	assert.equal(Str.subStr(txt, 3, null), txt.substring(3), 'null len, return sub(index)');
	assert.equal(Str.subStr(txt, 3, undefined), txt.substring(3), 'undefined len, return sub(index)');
	
	assert.equal(Str.subStr(txt, 30, null), txt, 'index exceeded input length, return original');
	assert.equal(Str.subStr(txt, 3, 3000), txt.substring(3), 'len exceeded input length, return sub(index)');
	assert.equal(Str.subStr(txt, 3000, 3000), txt, 'index and len exceeded input length, return original');
	
	assert.equal(Str.subStr(txt, 1), txt.substring(1), 'no len');
	assert.equal(Str.subStr(txt, 1, 3), txt.substring(1, 4), 'index & len');
	
	assert.equal(Str.subStr(txt, 11, 3), txt.substring(11), 'good index, but len exceeded the string length');
	
	assert.equal(Str.subStr(txt, -5), txt.substring(txt.length - 5), 'neg index "' + txt.substring(txt.length - 5) + '"');
	assert.equal(Str.subStr(txt, -5, 2), txt.substring(txt.length - 5, txt.length - 5 + 2), 'neg index with len "' + txt.substring(txt.length - 5, txt.length - 5 + 2) + '"');
	
	assert.equal(Str.subStr(txt, -5, 300), txt.substring(txt.length - 5), 'neg index with out of bound len "' + txt.substring(txt.length - 5) + '"');

	assert.equal(Str.subStr(txt, -5, -300), txt.substring(txt.length - 5), 'neg index with out of bound -len "' + txt.substring(txt.length - 5) + '"');
	
	assert.equal(Str.subStr(txt, -300, 2), txt, 'neg index out of bound, with proper len');
});


QUnit.test('Str - Str.format', function (assert){
	var obj = {
			name: 'joe',
			age: 27,
			bday: new Date(2000, 9, 27, 3, 20, 20, 999),
			balance: 30.293,
			grade: 0.73
		},
		array = ['a', 'b', 'c'];

	assert.ok(obj.hasOwnProperty('age'), 'hasOwnProperty');
	assert.ok(array.hasOwnProperty(1), 'index in array');
	assert.ok(!array.hasOwnProperty('b'), 'value NOT in array');
	
	assert.equal(Str.format('{0} + {1}', 7, 4), '7 + 4', 'value sub');

	/*
	var a = str.format("hello {0} {1} {0} {0}", "yo", "dude");
	a = str.format("hello {0.name} {0.age}", {name: "john", age: 10});	
	a = str.format("hello {0.1} {0.0}", ["first", "last"]);
	*/
	assert.equal(Str.format("hello {0} {1} {0} {0}", "yo", "dude"), 'hello yo dude yo yo', 'sub multiple objects');
	assert.equal(Str.format("hello {0.name} {0.age}", obj), 'hello joe 27', 'index sub');
	assert.equal(Str.format("hello {0.name} {0.age} {0.ink}", obj), 'hello joe 27 {0.ink}', 'index sub, index doesn\'t exits');
	assert.equal(Str.format("hello {0.1} {0.0}", ["first", "last"]), 'hello last first', 'index numeric property');

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


QUnit.test('Str - Str.regexEscape', function (assert) {
    var pattern = '.?*+^$[]\\(){}|-';
    var escaped = Str.regexEscape(pattern);
    var re = new RegExp(escaped);
    var m = re.exec(pattern);

    assert.equal(pattern, m[0], 'The escaped pattern must match the original pattern');
    var a1 = Str.regexEscape([pattern, pattern]);
    var a2 = [escaped, escaped];
    assert.deepEqual(a1, a2, 'Escape array');
});


QUnit.test('Str - Str.contains', function (assert) {
    var sample = 'aBCd;de';

    assert.ok(Str.containsAll(sample, 'Bc'), 'Contains string');
    assert.ok(Str.containsAll(sample, ['Bc', 'dE']), 'Contains all string');

    assert.notOk(Str.containsAll(sample, 'xx'), 'not found');
    assert.notOk(Str.containsAll(sample, 'Bc', true), 'case sensitive');
    assert.notOk(Str.containsAll(sample, ['Bc', 'dE'], true), 'case sensitive 2');
    assert.notOk(Str.containsAll(sample, ['Bc', 'dE', 'x']), 'not found');

	assert.ok(Str.containsAny(sample, 'Bc'), 'Contains string');
	assert.ok(Str.containsAny(sample, ['Bc', 'dE']), 'Contains all string');
	assert.ok(Str.containsAny(sample, ['Bcx', 'dE']), 'Contains one string');

	assert.notOk(Str.containsAny(sample, 'xx'), 'not found');
	assert.notOk(Str.containsAny(sample, 'Bc', true), 'case sensitive');
	assert.notOk(Str.containsAny(sample, ['xxxx', 'dE'], true), 'contains one');
	assert.notOk(Str.containsAny(sample, ['x', 'dEx', 'x']), 'not found');
});


QUnit.test('Str - Type Tests', function (assert) {
    assert.ok(Str.isString(''), 'blank');
    assert.ok(Str.isString('str'), 'not blank');

	assert.notOk(Str.isString({}), 'obj');
	assert.notOk(Str.isString([]), 'arr');
	assert.notOk(Str.isString(1), 'num');
	assert.notOk(Str.isString(1.0), 'float');
});


QUnit.test('Str - Str.trim', function (assert) {
	var sample = '  aabbcc  ';

    assert.equal(Str.trimStart(sample), 'aabbcc  ', 'just space');
    assert.equal(Str.trimStart(sample, [' ', 'a']), 'bbcc  ', 'remove multiple chars');
    assert.equal(Str.trimStart(sample, ['x']), sample, 'remove nothing');

    // assert.equal(Str.trimEnd(['']), '', '');
});


QUnit.test('Str - Str.parseJson', function (assert) {
    assert.equal(Str.parseJson(''), '', '');
});
