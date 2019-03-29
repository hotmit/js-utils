# Bundles
* js-utils.js 
    * All the library src, excludes all external libraries 
    * Publish utilities to global scope
* js-utils-full.js
    * js-utils.js with external libraries bundles within
        * js-base64
        * FlashDetect
        * urijs
        * jquery.blockUI
        * jquery.form.min.js
        * jquery.caret.js
        * jquery.cookie.js
* js-utils-private.js
    * All of js-utils.js, but the whole library publish under _ju
        * eg. Str becomes _ju.Str