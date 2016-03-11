/*global QUnit, Arr */

QUnit.test('Array - Arr.isArray', function (assert) {
    assert.notOk(Arr.isArray());
    assert.notOk(Arr.isArray(new Date()));
    assert.notOk(Arr.isArray(0));
    assert.notOk(Arr.isArray({}));
    assert.notOk(Arr.isArray({test: 'array'}));

    assert.ok(Arr.isArray([]));
    assert.ok(Arr.isArray([1, 2]));
});
