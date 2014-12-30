test('Equals', function (){
	var data = ['hello', '0', 0, 1, 0.0, 1.0, {}, {n:1}];		
	
	for(var i=0; i<data.length; i++){
		var d = data[i];
		
		Pref.set('test', d);
		var value = Pref.get('test', 'default value');
		
		equal(value, d, 'get with [name] ' + d);
	}
});



test('Not Deep Equals', function (){
	var data = [0, 1, 0.0, 1.0, {}, {n:1}];		
	
	for(var i=0; i<data.length; i++){
		var d = data[i];
		
		Pref.set('test', d);
		var value = Pref.get('test', 'default value');
		
		notDeepEqual(value, d, 'get with [name] ' + d);
	}
});



test('Test Default Value', function (){
	var data = [null, undefined];		
	
	for(var i=0; i<data.length; i++){
		var d = data[i];
		
		Pref.set('test', d);
		var value = Pref.get('test', 'default value');
		
		equal(value, 'default value', 'get with [name] ' + d);
	}
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