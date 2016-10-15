/*global jQuery, JU.__JU */

// STANDALONE: jq

(function (global, $, Obj) {
    "use strict";

    /**
     * Remove a property from the object and return the removed object.
     *
     * @param obj - the object in question
     * @param prop - the prop name
     * @param defaultValue - return this value if prop doesn't exist
     * @returns {*}
     */
    Obj.pop = function(obj, prop, defaultValue){
        if (!obj.hasOwnProperty(prop)){
            return defaultValue
        }

        var result = obj[prop];
        delete obj[prop];
        return result;
    };

    /**
     * Determine if object has the specified property.
     *
     * @param obj
     * @param prop
     * @returns {boolean}
     */
    Obj.hasProp = function(obj, prop){
        return obj.hasOwnProperty(prop);
    }

}(typeof window !== 'undefined' ? window : this, jQuery, JU.__JU.Obj));