/*global QUnit, Pref */


QUnit.test('Equals', function (assert){
	var data = ['hello', '0', 0, 1, 0.0, 1.0, {}, {n:1}];		
	
	for(var i=0; i<data.length; i++){
		var d = data[i];
		
		Pref.set('test', d);
		var value = Pref.get('test', 'default value');
		
		assert.equal(value, d, 'get with [name] ' + d);
	}
});


QUnit.test('Not Deep Equals', function (assert){
	var data = [0, 1, 0.0, 1.0, {}, {n:1}];		
	
	for(var i=0; i<data.length; i++){
		var d = data[i];
		
		Pref.set('test', d);
		var value = Pref.get('test', 'default value');

        assert.notDeepEqual(value, d, 'get with [name] ' + d);
	}
});


QUnit.test('Test Default Value', function (assert){
	var data = [null, undefined];		
	
	for(var i=0; i<data.length; i++){
		var d = data[i];
		
		Pref.set('test', d);
		var value = Pref.get('test', 'default value');

        assert.equal(value, 'default value', 'get with [name] ' + d);
	}
});

