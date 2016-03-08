/*global jQuery */

(function (global, $) {
    "use strict";

    var _JU = global._JU, JU = global.JU, Utl = JU.Utl;

    /**
     * Retrieve the value from the object using the attribute (dot notation is supported)
     *
     * @param obj {object} - any object
     * @param attr {string} - the attribute to retrieve (eg. contact.addresses.0.city)
     * @param defaultValue {object} - return this value on error or attribute not found.
     * @returns {*}
     */
    Utl.getAttr = _JU.getAttr;

    /**
     * Assign value to an attribute of the specified object.
     *
     * @param obj {object} - any object
     * @param attr {string} - the attribute to retrieve (eg. contact.addresses.0.city)
     * @param value {object} - the value to assign
     * @param skipIfExist {bool} - if true, don't override existing value.
     * @return {bool} - true if value has been assigned
     */
    Utl.setAttr = _JU.setAttr;

}(typeof window !== 'undefined' ? window : this, jQuery));