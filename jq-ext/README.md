# jQuery Plugins Folder

---
## BlockUI
```javascript
site.lightOverlayCSS = {
    background: '#eee url(/static/global/images/ajax-loader.gif) no-repeat center',
    backgroundSize: '16px 16px',
    opacity: 0.5
};

site.darkOverlayCSS = {
    background: '#000 url(/static/global/images/ajax-loader.gif) no-repeat center',
    backgroundSize: '16px 16px',
    opacity: 0.6
};

// Page Block
$.blockUI({message: null, overlayCSS: site.darkOverlayCSS});
$.unblockUI();

// Element Block
$('your element').block({message: null, overlayCSS: site.lightOverlayCSS});
$('your element').unblock();
``` 
    
---
## $.cookie