### Asset Test Functions
* async( [acceptCallCount ] )
* deepEqual( actual, expected [, message ] )
* equal( actual, expected [, message ] )
* expect( amount ) (expect number of assertions within the test)
* ok( state [, message ] )
* propEqual( actual, expected [, message ] ) (duck typing compare)
* push( result, actual, expected, message )
* strictEqual( actual, expected [, message ] )
* throws( block [, expected ] [, message ] )

* notDeepEqual()
* notEqual()
* notOk()
* notPropEqual()
* notStrictEqual()


### Throws
```javascript
assert.throws(
    function() {
        // code block
        throw "error";
    },
    "throws with just a message, not using the 'expected' argument"
);

assert.throws(
    function() {
      throw new CustomError("some error description");
    },
    new CustomError("some error description"),
    "raised error instance matches the CustomError instance"
);

assert.throws(
    function() {
      throw new CustomError("some error description");
    },
    function( err ) {
      return err.toString() === "some error description";
    },
    "raised error instance satisfies the callback function"
);
```


### Async
```javascript
QUnit.test( "assert.async() test", function( assert ) {
  var done = assert.async();
  var input = $( "#test-input" ).focus();
  setTimeout(function() {
    assert.equal( document.activeElement, input[0], "Input was focused" );
    done();
  });
});
```


### Custom Assertions
```javascript
QUnit.assert.mod2 = function( value, expected, message ) {
    var actual = value % 2;
    this.push( actual === expected, actual, expected, message );
};

QUnit.test( "mod2", function( assert ) {
    assert.expect( 2 );
 
    assert.mod2( 2, 0, "2 % 2 == 0" );
    assert.mod2( 3, 1, "3 % 2 == 1" );
});
```