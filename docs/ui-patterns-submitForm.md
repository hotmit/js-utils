
---
### Function definition
```javascript
/**
 * 1. submit to form.action using ajax
 * 2. if json is return {ajaxCommand}
 *      a. process the json
 *      b. if bsDialog is specified, close it
 * 3. if html is return, replace the form with the html provided
 *
 * Requires: jQuery Form (https://github.com/malsup/form.git)
 *  Support file upload through the use of https://github.com/malsup/form.git
 *
 * @param formSelector {selector} - this selector must work on the content of the ajax data as well
 * @param targetSelector {?selector} - which element to extract/update when the data is returned from an ajax call.
 * @param ajaxOptions {?object=} - $(form).ajaxForm(ajaxOptions)
 *                                      If undefined the form target is use
 * @param response {?function(data)=} - This get called when ajax has returned, the data can be json or html content.
 * @param parentDialog {?jQuery=} - the instance of bs dialog. This function will close
 *                                  the dialog once a command is received.
 * @param blockOptions {?object=} - blockUI options
 * @param context {?object=} - the object contains the functions specified by onPreParse and onPostParse.
 *                              If not specified the window object is used.
 * @param localTarget {?selector} - if specify it will replace the specify target with the return html. if not then
 *                                      replace the form as usual.
 */
Patterns.submitForm = function(formSelector, targetSelector, ajaxOptions,
                                    response, parentDialog, blockOptions, context, localTarget){
                                        
});
```
                                    
### AjaxOptions
```javascript
// Ref: http://api.jquery.com/jQuery.ajax/#options
// jQuery.form Ref: http://jquery.malsup.com/form/#options-object

var options = {
    beforeSerialize: function($form, options) { 
        // return false to cancel submit                  
    },
    
    beforeSubmit: function(arr, $form, options) { 
        // The array of form data takes the following form: 
        // [ { name: 'username', value: 'jresig' }, { name: 'password', value: 'secret' } ] 
        // return false to cancel submit                  
    },
    
    clearForm: bool,        // clear form on success
    
    data: {},               // $.ajax prop
    dataType: 'xml|json|script|html'         // $.ajax prop
    
    error: function(){},    // $.ajax prop
    forceSync: bool,   
    resetForm: bool,        // reset form on success
    
    semantic: bool,         // check type before submit (slower, use with image/file upload)
    
    target: 'selector',     // replace target with server returned value
    replaceTarget: bool,

    type: 'GET|POST',       // $.ajax prop

                            // process callback
    uploadProgress: function(event, position, total, percentComplete){}      
    
    url: 'url',             // $.ajax prop
};
```
