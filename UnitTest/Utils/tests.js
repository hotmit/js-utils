/*global QUnit, Utl */

QUnit.test('Utl.getAttr', function (assert){
    var complexObj = {
        '10': 'ten',
        i: 100,
        s: "hello",

        arr: ['red', 'green', 'blue', { name: 'pink', rgp: '#ffc0cb' , 'arr2': [0, 1, 'sub-sub']}],

        obj: {
            nested: {
                greeting: 'hello',
                '$illegal key': 'po po'
            },
            number: 10
        }
    }, simpleObj = {'hello': 'world'}, simpleArr = [99], notFound = 'no no no';


    assert.equal(_JU.getAttr(undefined, '', notFound), notFound, 'undefined object');
    assert.equal(_JU.getAttr(null, '', notFound), notFound, 'null object');
    assert.equal(_JU.getAttr(0, '', notFound), notFound, '0 object');
    assert.equal(_JU.getAttr(simpleArr, '', notFound), notFound, 'emptied attr');

    assert.equal(_JU.getAttr(simpleArr, '0', notFound), 99, 'array index');
    assert.equal(_JU.getAttr(simpleArr, '-1', notFound), notFound, 'array neg index');
    assert.equal(_JU.getAttr(simpleArr, '30', notFound), notFound, 'array not found index');

    assert.equal(_JU.getAttr(simpleObj, '0', notFound), notFound, 'obj not found');
    assert.equal(_JU.getAttr(simpleObj, 'hello', notFound), 'world', 'obj not found');

    assert.equal(_JU.getAttr(complexObj, '', notFound), notFound, 'complex obj not found');
    assert.equal(_JU.getAttr(complexObj, '10', notFound), 'ten', 'complex obj int key');
    assert.equal(_JU.getAttr(complexObj, 'i', notFound), '100', 'complex obj int value');
    assert.equal(_JU.getAttr(complexObj, 's', notFound), 'hello', 'complex obj int value');

    assert.equal(_JU.getAttr(complexObj, 'arr.-1', notFound), notFound, 'complex obj sub array not found');
    assert.equal(_JU.getAttr(complexObj, 'arr.0', notFound), 'red', 'complex obj sub array');
    assert.equal(_JU.getAttr(complexObj, 'arr.3.name', notFound), 'pink', 'complex obj sub array sub object');
    assert.equal(_JU.getAttr(complexObj, 'arr.3.arr2.2', notFound), 'sub-sub', 'complex obj sub array sub object sub array');
    assert.equal(_JU.getAttr(complexObj, 'arr.3.NOOO_name', notFound), notFound, 'complex obj sub array sub object, not found');

    assert.equal(_JU.getAttr(complexObj, 'obj.not_found', notFound), notFound, 'complex obj sub object, not found');
    assert.equal(_JU.getAttr(complexObj, 'obj.number', notFound), 10, 'complex obj sub object key');
    assert.equal(_JU.getAttr(complexObj, 'obj.nested.greeting', notFound), 'hello', 'complex obj sub object key');
    assert.equal(_JU.getAttr(complexObj, 'obj.nested.$illegal key', notFound), 'po po', 'complex obj sub object long space key');

});

QUnit.test('Utl.setAttr', function (assert)
{
    var complexObj = {}, simpleObj = {}, simpleArr = [], notFound = 'no no no';

    assert.notOk(_JU.setAttr(simpleArr, 'non existent', 99), 'assign non existent value');
    assert.equal(simpleArr.length, 0);

    assert.notOk(_JU.setAttr(simpleArr, '-1', 99), 'neg index');
    assert.equal(simpleArr.length, 0);

    assert.strictEqual(_JU.setAttr(simpleArr, '0', 99), true, 'index');
    assert.equal(simpleArr.length, 1);
    assert.equal(_JU.getAttr(simpleArr, '0'), 99);

    simpleArr = [];

    assert.strictEqual(_JU.setAttr(simpleArr, '5', 55), true, 'non existing index on emptied array');
    assert.equal(simpleArr.length, 6);
    assert.equal(_JU.getAttr(simpleArr, '5'), 55);

    assert.strictEqual(_JU.setAttr(simpleArr, '30', 330), true, 'non existing index on a existing array');
    assert.equal(simpleArr.length, 31);
    assert.equal(_JU.getAttr(simpleArr, '30'), 330);


    assert.strictEqual(_JU.setAttr(undefined, undefined, 'world'), false, 'undefined');
    assert.strictEqual(_JU.setAttr(simpleObj, undefined, 'world'), false, 'undefined');
    assert.strictEqual(_JU.setAttr(simpleObj, '', 'world'), false, 'undefined');

    assert.strictEqual(_JU.setAttr(simpleObj, 'hello', 'world'), true, 'non existing index on simple obj');
    assert.strictEqual(_JU.getAttr(simpleObj, 'hello', notFound), 'world', 'write verification');

});