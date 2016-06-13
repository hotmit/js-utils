# Javascript Toys
 
 > [docs/](Documentations)


# Get Submodules
```
// Start the first pull (ie like a clone)
git submodule update --init --recursive

// Update there after
git submodule foreach git pull origin master
```

# Publish Manually
```javascript

// if you skipped publish.js, this how you activate JU manually

var myLib = {};

JU.publish(JU.__JU, false, false);
delete JU.__JU;
JU.activate(myLib);
```



