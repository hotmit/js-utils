/*global QUnit, Utl */


QUnit.test('Utils - Utl Global Object', function (assert){
    assert.ok(window.JU, 'super global');
    assert.notOk(window.JU.Utl, 'Utl global');
    assert.ok(window.Utl, 'window Utl global');
});


function getAttrTest(assert, Utl) {
    var complexObj = {
        '10': 'ten',
        i: 100,
        s: "hello",

        arr: ['red', 'green', 'blue', {name: 'pink', rgp: '#ffc0cb', 'arr2': [0, 1, 'sub-sub']}],

        obj: {
            nested: {
                greeting: 'hello',
                '$illegal key': 'po po'
            },
            number: 10
        }
    }, simpleObj = {'hello': 'world'}, simpleArr = [99], notFound = 'no no no';


    assert.equal(Utl.getAttr(undefined, '', notFound), notFound, 'undefined object');
    assert.equal(Utl.getAttr(null, '', notFound), notFound, 'null object');
    assert.equal(Utl.getAttr(0, '', notFound), notFound, '0 object');
    assert.equal(Utl.getAttr(simpleArr, '', notFound), notFound, 'emptied attr');

    assert.equal(Utl.getAttr(simpleArr, '0', notFound), 99, 'array index');
    assert.equal(Utl.getAttr(simpleArr, '-1', notFound), notFound, 'array neg index');
    assert.equal(Utl.getAttr(simpleArr, '30', notFound), notFound, 'array not found index');

    assert.equal(Utl.getAttr(simpleObj, '0', notFound), notFound, 'obj not found');
    assert.equal(Utl.getAttr(simpleObj, 'hello', notFound), 'world', 'obj not found');

    assert.equal(Utl.getAttr(complexObj, '', notFound), notFound, 'complex obj not found');
    assert.equal(Utl.getAttr(complexObj, '10', notFound), 'ten', 'complex obj int key');
    assert.equal(Utl.getAttr(complexObj, 'i', notFound), '100', 'complex obj int value');
    assert.equal(Utl.getAttr(complexObj, 's', notFound), 'hello', 'complex obj int value');

    assert.equal(Utl.getAttr(complexObj, 'arr.-1', notFound), notFound, 'complex obj sub array not found');
    assert.equal(Utl.getAttr(complexObj, 'arr.0', notFound), 'red', 'complex obj sub array');
    assert.equal(Utl.getAttr(complexObj, 'arr.3.name', notFound), 'pink', 'complex obj sub array sub object');
    assert.equal(Utl.getAttr(complexObj, 'arr.3.arr2.2', notFound), 'sub-sub', 'complex obj sub array sub object sub array');
    assert.equal(Utl.getAttr(complexObj, 'arr.3.NOOO_name', notFound), notFound, 'complex obj sub array sub object, not found');

    assert.equal(Utl.getAttr(complexObj, 'obj.not_found', notFound), notFound, 'complex obj sub object, not found');
    assert.equal(Utl.getAttr(complexObj, 'obj.nested.greeting', notFound), 'hello', 'complex obj sub object key');
    assert.equal(Utl.getAttr(complexObj, 'obj.nested.$illegal key', notFound), 'po po', 'complex obj sub object long space key');
    assert.equal(Utl.getAttr(complexObj, 'obj.number', notFound), 10, 'complex obj sub object key');
}


QUnit.test('Utils - Utl.getAttr Custom Target', function (assert){
    var arbitraryTarget = {};
    JU.activate(arbitraryTarget);
    assert.ok(arbitraryTarget.Utl, 'util in target');
    getAttrTest(assert, arbitraryTarget.Utl);
});


QUnit.test('Utils - window.Utl.getAttr', function (assert){
    getAttrTest(assert, window.Utl);
});


function setAttrTest(assert, Utl) {
    var complexObj = {}, simpleObj = {}, simpleArr = [], notFound = 'no no no';

    assert.notOk(Utl.setAttr(simpleArr, 'non existent', 99), 'assign non existent value');
    assert.equal(simpleArr.length, 0);

    assert.notOk(Utl.setAttr(simpleArr, '-1', 99), 'neg index');
    assert.equal(simpleArr.length, 0);

    assert.strictEqual(Utl.setAttr(simpleArr, '0', 99), true, 'index');
    assert.equal(simpleArr.length, 1);
    assert.equal(Utl.getAttr(simpleArr, '0'), 99);

    simpleArr = [];

    assert.strictEqual(Utl.setAttr(simpleArr, '5', 55), true, 'non existing index on emptied array');
    assert.equal(simpleArr.length, 6);
    assert.equal(Utl.getAttr(simpleArr, '5'), 55);

    assert.strictEqual(Utl.setAttr(simpleArr, '30', 330), true, 'non existing index on a existing array');
    assert.equal(simpleArr.length, 31);
    assert.equal(Utl.getAttr(simpleArr, '30'), 330);


    assert.strictEqual(Utl.setAttr(undefined, undefined, 'world'), false, 'undefined');
    assert.strictEqual(Utl.setAttr(simpleObj, undefined, 'world'), false, 'undefined');
    assert.strictEqual(Utl.setAttr(simpleObj, '', 'world'), false, 'undefined');

    assert.strictEqual(Utl.setAttr(simpleObj, 'hello', 'world'), true, 'non existing index on simple obj');
    assert.strictEqual(Utl.getAttr(simpleObj, 'hello', notFound), 'world', 'write verification');

    assert.strictEqual(Utl.setAttr(complexObj, '10', 'ten'), true, 'non existing index on complex obj');
    assert.strictEqual(Utl.setAttr(complexObj, '10', 'ten'), true, 'existed index on complex obj');
    assert.strictEqual(Utl.setAttr(complexObj, 10, 'ten'), true, 'existed index on complex obj');
    assert.strictEqual(Utl.getAttr(complexObj, '10', notFound), 'ten', 'write verification');

    assert.strictEqual(Utl.setAttr(complexObj, 'i', 100), true, 'non existing index on complex obj');
    assert.strictEqual(Utl.getAttr(complexObj, 'i', notFound), 100, 'write verification');

    assert.strictEqual(Utl.setAttr(complexObj, 's', 'hello'), true, 'non existing index on complex obj');
    assert.strictEqual(Utl.getAttr(complexObj, 's', notFound), 'hello', 'write verification');

    assert.strictEqual(Utl.setAttr(complexObj, 'arr', []), true, 'non existing index on complex obj');
    var arr = Utl.getAttr(complexObj, 'arr', notFound);
    assert.ok($.isArray(arr) && arr.length === 0, 'write verification');

    assert.strictEqual(Utl.setAttr(complexObj, 'arr.2', 'blue'), true, 'non existing index of an array');
    assert.strictEqual(Utl.getAttr(complexObj, 'arr.2', notFound), 'blue', 'write verification');
    assert.strictEqual(Utl.getAttr(complexObj, 'arr', notFound).length, 3, 'write verification');
    assert.strictEqual(Utl.getAttr(complexObj, 'arr.0', notFound), null, 'write verification');
    assert.notStrictEqual(Utl.getAttr(complexObj, 'arr.0', notFound), undefined, 'null verification');

    assert.strictEqual(Utl.setAttr(complexObj, 'arr.3', {name: 'pink', rgp: '#ffc0cb'}), true, 'non existing index of an array');
    assert.strictEqual(Utl.getAttr(complexObj, 'arr.3.name', notFound), 'pink', 'write verification');
    assert.strictEqual(Utl.getAttr(complexObj, 'arr.3.rgp', notFound), '#ffc0cb', 'write verification');

    assert.strictEqual(Utl.setAttr(complexObj, 'arr.0', 'red'), true, 'non existing index of an array');
    assert.strictEqual(Utl.setAttr(complexObj, 'arr.1', 'green'), true, 'non existing index of an array');
    assert.strictEqual(Utl.setAttr(complexObj, 'arr.3.arr2', []), true, 'non existing index of an array');

    assert.strictEqual(Utl.setAttr(complexObj, 'arr.3.arr2.2', 'sub-sub'), true, 'non existing index of an array');
    assert.strictEqual(Utl.getAttr(complexObj, 'arr.3.arr2.2', notFound), 'sub-sub', 'write verification');

    assert.strictEqual(Utl.setAttr(complexObj, 'arr.3.arr2.2', 'sub-sub'), true, 'non existing index of an array');
    assert.strictEqual(Utl.getAttr(complexObj, 'arr.3.arr2.2', notFound), 'sub-sub', 'write verification');

    assert.strictEqual(Utl.setAttr(complexObj, 'arr.3.arr2.1', 1), true, 'non existing index of an array');
    assert.strictEqual(Utl.getAttr(complexObj, 'arr.3.arr2.1', notFound), 1, 'write verification');

    assert.strictEqual(Utl.setAttr(complexObj, 'arr.3.arr2.0', 0), true, 'non existing index of an array');
    assert.strictEqual(Utl.getAttr(complexObj, 'arr.3.arr2.0', notFound), 0, 'write verification');

    assert.strictEqual(Utl.setAttr(complexObj, 'obj', {}), true, 'non existing index of an array');
    assert.strictEqual(Utl.setAttr(complexObj, 'obj.nested', {}), true, 'non existing index of an array');
    assert.strictEqual(Utl.setAttr(complexObj, 'obj.nested.greeting', 'hello'), true, 'non existing index of an array');
    assert.strictEqual(Utl.setAttr(complexObj, 'obj.nested.$illegal key', 'po po'), true, 'non existing index of an array');
    assert.strictEqual(Utl.setAttr(complexObj, 'obj.number', 10), true, 'non existing index of an array');

    assert.deepEqual(complexObj, {
        '10': 'ten',
        i: 100,
        s: "hello",

        arr: ['red', 'green', 'blue', {name: 'pink', rgp: '#ffc0cb', 'arr2': [0, 1, 'sub-sub']}],

        obj: {
            nested: {
                greeting: 'hello',
                '$illegal key': 'po po'
            },
            number: 10
        }
    }, 'Final result');
}


QUnit.test('Utils - Utl.setAttr Custom Target', function (assert)
{
    var arbitraryTarget = {};
    JU.activate(arbitraryTarget);
    assert.ok(arbitraryTarget.Utl, 'util in target');
    setAttrTest(assert, arbitraryTarget.Utl);
});


QUnit.test('Utils - window.Utl.setAttr', function (assert)
{
    setAttrTest(assert, window.Utl);
});