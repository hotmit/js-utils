/*global QUnit, Pref */



// This test only works under firefox, to get it work under other browser put this file on a webserver
if(navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {


    QUnit.test('Pref - Equals', function (assert) {
        var data = ['hello', '0', 0, 1, 0.0, 1.0, {}, {n: 1}];

        for (var i = 0; i < data.length; i++) {
            var d = data[i];

            Pref.set('test', d);
            var value = Pref.get('test', 'default value');

            assert.equal(value, d, 'get with [name] ' + d);
        }
    });


    QUnit.test('Pref - Not Deep Equals', function (assert) {
        var data = [0, 1, 0.0, 1.0, {}, {n: 1}];

        for (var i = 0; i < data.length; i++) {
            var d = data[i];

            Pref.set('test', d);
            var value = Pref.get('test', 'default value');

            assert.notDeepEqual(value, d, 'get with [name] ' + d);
        }
    });


    QUnit.test('Pref - Test Default Value', function (assert) {
        var data = [null, undefined];

        for (var i = 0; i < data.length; i++) {
            var d = data[i];

            Pref.set('test', d);
            var value = Pref.get('test', 'default value');

            assert.equal(value, 'default value', 'get with [name] ' + d);
        }
    });
}