# External Libraries (non jQuery Plugins only)

---
## Base64
* Base64.encode('dankogai');        # ZGFua29nYWk=
* Base64.decode('ZGFua29nYWk=');    # dankogai
    
---
## Json-js
* JSON.stringify(value [, replacer][, space])
* JSON.stringify({hello: 'world'});     # {"hello": "world"}
* JSON.json_parse(text [, reviver]);  
* JSON.json_parse(text, function (key, value) {

---
## Flash Detect
* FlashDetect.installed: true
* FlashDetect.major: 20
* FlashDetect.versionAtLeast(9): true
* FlashDetect.versionAtLeast(9, 2): true	# major, minor