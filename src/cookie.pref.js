/*global jQuery, JU.__JU, Arr, Str */

// REQ: jq, arr.js, jquery.cookie.js


(function (global, $, Pref, Str) {
    "use strict";

    var _defaultOptions = { expires: 90, path: '/', secure: false };

    /**
     *
     * @param name {string}
     * @param value {string|object}
     * @param options {object=} - 	expires: #days|date()|90,
     *			  					path: string|'/',
     *								domain: string|'',
     *								secure: bool|false
     */
    Pref.set = function (name, value, options){
        var opt = $.extend({}, _defaultOptions, options);
        if (value == undefined){
            $.removeCookie(name, opt);
        }
        else {
            $.cookie(name, value, opt);
        }
    };

    /**
     * Get the cookie value
     *
     * @param name {string}
     * @param defaultValue {boolean|object=}
     * @returns {*}
     */
    Pref.get = function (name, defaultValue){
        var value = $.cookie(name);
        return value == undefined ? defaultValue : value;
    };

    /**
     * Remove the cookie
     *
     * @param name {string}
     * @param options {{path:string}=} - default value is '/'
     */
    Pref.remove = function (name, options){
        var opt = $.extend({}, _defaultOptions, options);
        $.removeCookie(name, opt);
    };

}(typeof window !== 'undefined' ? window : this, jQuery,
    JU.__JU.Pref, JU.__JU.Str));
