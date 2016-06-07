/*global jQuery */

(function (global, $) {
    "use strict";

    if (global.URI){
        global.URI.prototype.getSearch = function(name, defaultValue){
            var searchValues = this.search(true);
            if (searchValues.hasOwnProperty(name)){
                return searchValues[name];
            }
            return defaultValue;
        };
    }
}(typeof window !== 'undefined' ? window : this, jQuery));