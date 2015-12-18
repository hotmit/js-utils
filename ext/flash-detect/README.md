# Flash Detect
* Src: http://www.featureblend.com/javascript-flash-detection-library.html

```
if (FlashDetect.installed) {
	alert("Flash is installed on your Web browser.");
}
else {
  alert("Flash is required to enjoy this site.");     	
}
```

## Properties:
* FlashDetect.installed: true
* FlashDetect.raw: Shockwave Flash 20.0 r0
* FlashDetect.major: 20
* FlashDetect.minor: 0
* FlashDetect.revision: -1
* FlashDetect.revisionStr: r0
* FlashDetect.JS_RELEASE: 1.0.4

## Method(s):
* FlashDetect.versionAtLeast(9): true
* FlashDetect.versionAtLeast(9, 0): true
* FlashDetect.versionAtLeast(9, 0, 124): true
* FlashDetect.majorAtLeast(9): true
* FlashDetect.minorAtLeast(0): true
* FlashDetect.revisionAtLeast(124): false
