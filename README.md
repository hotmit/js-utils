# Javascript Toys
 
 > [docs/](Documentations)


# Build
```
npm run build
    OR
gulp release
```

# Publish Manually
```javascript

// if you skipped publish.js, this how you activate JU manually

var myLib = {};

JU.publish(JU.__JU, false, false);
delete JU.__JU;
JU.activate(myLib);

// eg.
myLib.Str.contains('hello', 'll');  // => true
```



