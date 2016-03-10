/*global jQuery, JU.__JU */

(function (global, Utl) {
    "use strict";

    //region [ Helper Functions ]
    /**
     * Check if the object is an Array type
     *
     * @param obj {object}
     * @returns {boolean}
     */
    function _isArray(obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
    }

    /**
     * Test for positive number (ie number >= 0)
     * @param num
     * @returns {boolean}
     */
    function _isPositiveNumber(num) {
        if (typeof num == 'number' || typeof num == 'string') {
            var number = Number(num);
            return isNaN(number) ? false : number >= 0;
        }
        return false;
    }

    //endregion

    /**
     * Retrieve the value from the object using the attribute (dot notation is supported)
     *
     * @param obj {!object} - any object
     * @param attr {!string} - the attribute to retrieve (eg. contact.addresses.0.city)
     * @param defaultValue {?object=} - return this value on error or attribute not found.
     * @returns {*}
     */
    Utl.getAttr = function(obj, attr, defaultValue){
        var attrParts, i, newObj, curAttr;

        if (obj && attr != undefined && attr.length > 0){
            if (attr.indexOf('.') == -1){
                if (obj.hasOwnProperty(attr)){
                    return obj[attr];
                }
                return defaultValue;
            }
            else {
                attrParts = attr.split('.');
                newObj = obj;
                for (i=0; i<attrParts.length; i++)
                {
                    curAttr = attrParts[i];

                    if (newObj.hasOwnProperty(curAttr)){
                        newObj = newObj[curAttr];

                        if (i == attrParts.length - 1){
                            return newObj;
                        }
                    }
                    else {
                        return defaultValue;
                    }
                }
            }
        }
        return defaultValue;
    };

    /**
     * Assign value to an attribute of the specified object.
     *
     * @param obj {!object} - any object
     * @param attr {!string} - the attribute to retrieve (eg. contact.addresses.0.city)
     * @param value {?object} - the value to assign
     * @param skipIfExist {boolean=} - if true, don't override existing value.
     * @return {boolean} - true if value has been assigned
     */
    Utl.setAttr = function(obj, attr, value, skipIfExist){
        var attrParts, i, newObj, arrIndex, curAttr;

        if (obj && attr != undefined && attr.length > 0){
            if (attr.indexOf('.') == -1){
                if (!skipIfExist || !obj.hasOwnProperty(attr)){
                    if (_isArray(obj))
                    {
                        if (_isPositiveNumber(attr)){
                            arrIndex = Number(attr);
                            if (arrIndex >= obj.length && arrIndex > 0)
                            {
                                for(i=obj.length; i<arrIndex; i++){
                                    obj.push(null);
                                }
                                obj.push(value);
                                return true;
                            }
                            obj.splice(arrIndex, 1, value);
                            return true;
                        }
                    }
                    else {
                        obj[attr] = value;
                        return true;
                    }
                }
            }
            else {
                attrParts = attr.split('.');
                newObj = obj;
                for (i=0; i<attrParts.length; i++)
                {
                    curAttr = attrParts[i];
                    if (i < attrParts.length - 1){
                        Utl.setAttr(newObj, curAttr, {}, true);
                    }
                    else {
                        return Utl.setAttr(newObj, curAttr, value, skipIfExist);
                    }
                    newObj =  Utl.getAttr(newObj, curAttr, undefined);
                }
            }
        }
        return false;
    };

}(typeof window !== 'undefined' ? window : this, JU.__JU.Utl));