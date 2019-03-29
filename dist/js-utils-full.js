/*
 *  base64.js
 *
 *  Licensed under the BSD 3-Clause License.
 *    http://opensource.org/licenses/BSD-3-Clause
 *
 *  References:
 *    http://en.wikipedia.org/wiki/Base64
 */
;(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined'
        ? module.exports = factory(global)
        : typeof define === 'function' && define.amd
        ? define(factory) : factory(global)
}((
    typeof self !== 'undefined' ? self
        : typeof window !== 'undefined' ? window
        : typeof global !== 'undefined' ? global
: this
), function(global) {
    'use strict';
    // existing version for noConflict()
    global = global || {};
    var _Base64 = global.Base64;
    var version = "2.5.1";
    // if node.js and NOT React Native, we use Buffer
    var buffer;
    if (typeof module !== 'undefined' && module.exports) {
        try {
            buffer = eval("require('buffer').Buffer");
        } catch (err) {
            buffer = undefined;
        }
    }
    // constants
    var b64chars
        = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    var b64tab = function(bin) {
        var t = {};
        for (var i = 0, l = bin.length; i < l; i++) t[bin.charAt(i)] = i;
        return t;
    }(b64chars);
    var fromCharCode = String.fromCharCode;
    // encoder stuff
    var cb_utob = function(c) {
        if (c.length < 2) {
            var cc = c.charCodeAt(0);
            return cc < 0x80 ? c
                : cc < 0x800 ? (fromCharCode(0xc0 | (cc >>> 6))
                                + fromCharCode(0x80 | (cc & 0x3f)))
                : (fromCharCode(0xe0 | ((cc >>> 12) & 0x0f))
                   + fromCharCode(0x80 | ((cc >>>  6) & 0x3f))
                   + fromCharCode(0x80 | ( cc         & 0x3f)));
        } else {
            var cc = 0x10000
                + (c.charCodeAt(0) - 0xD800) * 0x400
                + (c.charCodeAt(1) - 0xDC00);
            return (fromCharCode(0xf0 | ((cc >>> 18) & 0x07))
                    + fromCharCode(0x80 | ((cc >>> 12) & 0x3f))
                    + fromCharCode(0x80 | ((cc >>>  6) & 0x3f))
                    + fromCharCode(0x80 | ( cc         & 0x3f)));
        }
    };
    var re_utob = /[\uD800-\uDBFF][\uDC00-\uDFFFF]|[^\x00-\x7F]/g;
    var utob = function(u) {
        return u.replace(re_utob, cb_utob);
    };
    var cb_encode = function(ccc) {
        var padlen = [0, 2, 1][ccc.length % 3],
        ord = ccc.charCodeAt(0) << 16
            | ((ccc.length > 1 ? ccc.charCodeAt(1) : 0) << 8)
            | ((ccc.length > 2 ? ccc.charCodeAt(2) : 0)),
        chars = [
            b64chars.charAt( ord >>> 18),
            b64chars.charAt((ord >>> 12) & 63),
            padlen >= 2 ? '=' : b64chars.charAt((ord >>> 6) & 63),
            padlen >= 1 ? '=' : b64chars.charAt(ord & 63)
        ];
        return chars.join('');
    };
    var btoa = global.btoa ? function(b) {
        return global.btoa(b);
    } : function(b) {
        return b.replace(/[\s\S]{1,3}/g, cb_encode);
    };
    var _encode = buffer ?
        buffer.from && Uint8Array && buffer.from !== Uint8Array.from
        ? function (u) {
            return (u.constructor === buffer.constructor ? u : buffer.from(u))
                .toString('base64')
        }
        :  function (u) {
            return (u.constructor === buffer.constructor ? u : new  buffer(u))
                .toString('base64')
        }
        : function (u) { return btoa(utob(u)) }
    ;
    var encode = function(u, urisafe) {
        return !urisafe
            ? _encode(String(u))
            : _encode(String(u)).replace(/[+\/]/g, function(m0) {
                return m0 == '+' ? '-' : '_';
            }).replace(/=/g, '');
    };
    var encodeURI = function(u) { return encode(u, true) };
    // decoder stuff
    var re_btou = new RegExp([
        '[\xC0-\xDF][\x80-\xBF]',
        '[\xE0-\xEF][\x80-\xBF]{2}',
        '[\xF0-\xF7][\x80-\xBF]{3}'
    ].join('|'), 'g');
    var cb_btou = function(cccc) {
        switch(cccc.length) {
        case 4:
            var cp = ((0x07 & cccc.charCodeAt(0)) << 18)
                |    ((0x3f & cccc.charCodeAt(1)) << 12)
                |    ((0x3f & cccc.charCodeAt(2)) <<  6)
                |     (0x3f & cccc.charCodeAt(3)),
            offset = cp - 0x10000;
            return (fromCharCode((offset  >>> 10) + 0xD800)
                    + fromCharCode((offset & 0x3FF) + 0xDC00));
        case 3:
            return fromCharCode(
                ((0x0f & cccc.charCodeAt(0)) << 12)
                    | ((0x3f & cccc.charCodeAt(1)) << 6)
                    |  (0x3f & cccc.charCodeAt(2))
            );
        default:
            return  fromCharCode(
                ((0x1f & cccc.charCodeAt(0)) << 6)
                    |  (0x3f & cccc.charCodeAt(1))
            );
        }
    };
    var btou = function(b) {
        return b.replace(re_btou, cb_btou);
    };
    var cb_decode = function(cccc) {
        var len = cccc.length,
        padlen = len % 4,
        n = (len > 0 ? b64tab[cccc.charAt(0)] << 18 : 0)
            | (len > 1 ? b64tab[cccc.charAt(1)] << 12 : 0)
            | (len > 2 ? b64tab[cccc.charAt(2)] <<  6 : 0)
            | (len > 3 ? b64tab[cccc.charAt(3)]       : 0),
        chars = [
            fromCharCode( n >>> 16),
            fromCharCode((n >>>  8) & 0xff),
            fromCharCode( n         & 0xff)
        ];
        chars.length -= [0, 0, 2, 1][padlen];
        return chars.join('');
    };
    var _atob = global.atob ? function(a) {
        return global.atob(a);
    } : function(a){
        return a.replace(/\S{1,4}/g, cb_decode);
    };
    var atob = function(a) {
        return _atob(String(a).replace(/[^A-Za-z0-9\+\/]/g, ''));
    };
    var _decode = buffer ?
        buffer.from && Uint8Array && buffer.from !== Uint8Array.from
        ? function(a) {
            return (a.constructor === buffer.constructor
                    ? a : buffer.from(a, 'base64')).toString();
        }
        : function(a) {
            return (a.constructor === buffer.constructor
                    ? a : new buffer(a, 'base64')).toString();
        }
        : function(a) { return btou(_atob(a)) };
    var decode = function(a){
        return _decode(
            String(a).replace(/[-_]/g, function(m0) { return m0 == '-' ? '+' : '/' })
                .replace(/[^A-Za-z0-9\+\/]/g, '')
        );
    };
    var noConflict = function() {
        var Base64 = global.Base64;
        global.Base64 = _Base64;
        return Base64;
    };
    // export Base64
    global.Base64 = {
        VERSION: version,
        atob: atob,
        btoa: btoa,
        fromBase64: decode,
        toBase64: encode,
        utob: utob,
        encode: encode,
        encodeURI: encodeURI,
        btou: btou,
        decode: decode,
        noConflict: noConflict,
        __buffer__: buffer
    };
    // if ES5 is available, make Base64.extendString() available
    if (typeof Object.defineProperty === 'function') {
        var noEnum = function(v){
            return {value:v,enumerable:false,writable:true,configurable:true};
        };
        global.Base64.extendString = function () {
            Object.defineProperty(
                String.prototype, 'fromBase64', noEnum(function () {
                    return decode(this)
                }));
            Object.defineProperty(
                String.prototype, 'toBase64', noEnum(function (urisafe) {
                    return encode(this, urisafe)
                }));
            Object.defineProperty(
                String.prototype, 'toBase64URI', noEnum(function () {
                    return encode(this, true)
                }));
        };
    }
    //
    // export Base64 to the namespace
    //
    if (global['Meteor']) { // Meteor.js
        Base64 = global.Base64;
    }
    // module.exports and AMD are mutually exclusive.
    // module.exports has precedence.
    if (typeof module !== 'undefined' && module.exports) {
        module.exports.Base64 = global.Base64;
    }
    else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], function(){ return global.Base64 });
    }
    // that's it!
    return {Base64: global.Base64}
}));

/*
Copyright (c) Copyright (c) 2007, Carl S. Yestrau All rights reserved.
Code licensed under the BSD License: http://www.featureblend.com/license.txt
Version: 1.0.4
*/
var FlashDetect = function(){
    var self = this;
    self.installed = false;
    self.raw = "";
    self.major = -1;
    self.minor = -1;
    self.revision = -1;
    self.revisionStr = "";
    var activeXDetectRules = [
        {
            "name":"ShockwaveFlash.ShockwaveFlash.7",
            "version":function(obj){
                return getActiveXVersion(obj);
            }
        },
        {
            "name":"ShockwaveFlash.ShockwaveFlash.6",
            "version":function(obj){
                var version = "6,0,21";
                try{
                    obj.AllowScriptAccess = "always";
                    version = getActiveXVersion(obj);
                }catch(err){}
                return version;
            }
        },
        {
            "name":"ShockwaveFlash.ShockwaveFlash",
            "version":function(obj){
                return getActiveXVersion(obj);
            }
        }
    ];
    /**
     * Extract the ActiveX version of the plugin.
     *
     * @param {Object} The flash ActiveX object.
     * @type String
     */
    var getActiveXVersion = function(activeXObj){
        var version = -1;
        try{
            version = activeXObj.GetVariable("$version");
        }catch(err){}
        return version;
    };
    /**
     * Try and retrieve an ActiveX object having a specified name.
     *
     * @param {String} name The ActiveX object name lookup.
     * @return One of ActiveX object or a simple object having an attribute of activeXError with a value of true.
     * @type Object
     */
    var getActiveXObject = function(name){
        var obj = -1;
        try{
            obj = new ActiveXObject(name);
        }catch(err){
            obj = {activeXError:true};
        }
        return obj;
    };
    /**
     * Parse an ActiveX $version string into an object.
     *
     * @param {String} str The ActiveX Object GetVariable($version) return value.
     * @return An object having raw, major, minor, revision and revisionStr attributes.
     * @type Object
     */
    var parseActiveXVersion = function(str){
        var versionArray = str.split(",");//replace with regex
        return {
            "raw":str,
            "major":parseInt(versionArray[0].split(" ")[1], 10),
            "minor":parseInt(versionArray[1], 10),
            "revision":parseInt(versionArray[2], 10),
            "revisionStr":versionArray[2]
        };
    };
    /**
     * Parse a standard enabledPlugin.description into an object.
     *
     * @param {String} str The enabledPlugin.description value.
     * @return An object having raw, major, minor, revision and revisionStr attributes.
     * @type Object
     */
    var parseStandardVersion = function(str){
        var descParts = str.split(/ +/);
        var majorMinor = descParts[2].split(/\./);
        var revisionStr = descParts[3];
        return {
            "raw":str,
            "major":parseInt(majorMinor[0], 10),
            "minor":parseInt(majorMinor[1], 10),
            "revisionStr":revisionStr,
            "revision":parseRevisionStrToInt(revisionStr)
        };
    };
    /**
     * Parse the plugin revision string into an integer.
     *
     * @param {String} The revision in string format.
     * @type Number
     */
    var parseRevisionStrToInt = function(str){
        return parseInt(str.replace(/[a-zA-Z]/g, ""), 10) || self.revision;
    };
    /**
     * Is the major version greater than or equal to a specified version.
     *
     * @param {Number} version The minimum required major version.
     * @type Boolean
     */
    self.majorAtLeast = function(version){
        return self.major >= version;
    };
    /**
     * Is the minor version greater than or equal to a specified version.
     *
     * @param {Number} version The minimum required minor version.
     * @type Boolean
     */
    self.minorAtLeast = function(version){
        return self.minor >= version;
    };
    /**
     * Is the revision version greater than or equal to a specified version.
     *
     * @param {Number} version The minimum required revision version.
     * @type Boolean
     */
    self.revisionAtLeast = function(version){
        return self.revision >= version;
    };
    /**
     * Is the version greater than or equal to a specified major, minor and revision.
     *
     * @param {Number} major The minimum required major version.
     * @param {Number} (Optional) minor The minimum required minor version.
     * @param {Number} (Optional) revision The minimum required revision version.
     * @type Boolean
     */
    self.versionAtLeast = function(major){
        var properties = [self.major, self.minor, self.revision];
        var len = Math.min(properties.length, arguments.length);
        for(i=0; i<len; i++){
            if(properties[i]>=arguments[i]){
                if(i+1<len && properties[i]==arguments[i]){
                    continue;
                }else{
                    return true;
                }
            }else{
                return false;
            }
        }
    };
    /**
     * Constructor, sets raw, major, minor, revisionStr, revision and installed public properties.
     */
    self.FlashDetect = function(){
        if(navigator.plugins && navigator.plugins.length>0){
            var type = 'application/x-shockwave-flash';
            var mimeTypes = navigator.mimeTypes;
            if(mimeTypes && mimeTypes[type] && mimeTypes[type].enabledPlugin && mimeTypes[type].enabledPlugin.description){
                var version = mimeTypes[type].enabledPlugin.description;
                var versionObj = parseStandardVersion(version);
                self.raw = versionObj.raw;
                self.major = versionObj.major;
                self.minor = versionObj.minor;
                self.revisionStr = versionObj.revisionStr;
                self.revision = versionObj.revision;
                self.installed = true;
            }
        }else if(navigator.appVersion.indexOf("Mac")==-1 && window.execScript){
            var version = -1;
            for(var i=0; i<activeXDetectRules.length && version==-1; i++){
                var obj = getActiveXObject(activeXDetectRules[i].name);
                if(!obj.activeXError){
                    self.installed = true;
                    version = activeXDetectRules[i].version(obj);
                    if(version!=-1){
                        var versionObj = parseActiveXVersion(version);
                        self.raw = versionObj.raw;
                        self.major = versionObj.major;
                        self.minor = versionObj.minor;
                        self.revision = versionObj.revision;
                        self.revisionStr = versionObj.revisionStr;
                    }
                }
            }
        }
    }();
};
FlashDetect.JS_RELEASE = "1.0.4";

module.exports = FlashDetect;

/*!
 * URI.js - Mutating URLs
 *
 * Version: 1.19.1
 *
 * Author: Rodney Rehm
 * Web: http://medialize.github.io/URI.js/
 *
 * Licensed under
 *   MIT License http://www.opensource.org/licenses/mit-license
 *
 */
(function (root, factory) {
  'use strict';
  // https://github.com/umdjs/umd/blob/master/returnExports.js
  if (typeof module === 'object' && module.exports) {
    // Node
    module.exports = factory(require('./punycode'), require('./IPv6'), require('./SecondLevelDomains'));
  } else if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['./punycode', './IPv6', './SecondLevelDomains'], factory);
  } else {
    // Browser globals (root is window)
    root.URI = factory(root.punycode, root.IPv6, root.SecondLevelDomains, root);
  }
}(this, function (punycode, IPv6, SLD, root) {
  'use strict';
  /*global location, escape, unescape */
  // FIXME: v2.0.0 renamce non-camelCase properties to uppercase
  /*jshint camelcase: false */

  // save current URI variable, if any
  var _URI = root && root.URI;

  function URI(url, base) {
    var _urlSupplied = arguments.length >= 1;
    var _baseSupplied = arguments.length >= 2;

    // Allow instantiation without the 'new' keyword
    if (!(this instanceof URI)) {
      if (_urlSupplied) {
        if (_baseSupplied) {
          return new URI(url, base);
        }

        return new URI(url);
      }

      return new URI();
    }

    if (url === undefined) {
      if (_urlSupplied) {
        throw new TypeError('undefined is not a valid argument for URI');
      }

      if (typeof location !== 'undefined') {
        url = location.href + '';
      } else {
        url = '';
      }
    }

    if (url === null) {
      if (_urlSupplied) {
        throw new TypeError('null is not a valid argument for URI');
      }
    }

    this.href(url);

    // resolve to base according to http://dvcs.w3.org/hg/url/raw-file/tip/Overview.html#constructor
    if (base !== undefined) {
      return this.absoluteTo(base);
    }

    return this;
  }

  function isInteger(value) {
    return /^[0-9]+$/.test(value);
  }

  URI.version = '1.19.1';

  var p = URI.prototype;
  var hasOwn = Object.prototype.hasOwnProperty;

  function escapeRegEx(string) {
    // https://github.com/medialize/URI.js/commit/85ac21783c11f8ccab06106dba9735a31a86924d#commitcomment-821963
    return string.replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1');
  }

  function getType(value) {
    // IE8 doesn't return [Object Undefined] but [Object Object] for undefined value
    if (value === undefined) {
      return 'Undefined';
    }

    return String(Object.prototype.toString.call(value)).slice(8, -1);
  }

  function isArray(obj) {
    return getType(obj) === 'Array';
  }

  function filterArrayValues(data, value) {
    var lookup = {};
    var i, length;

    if (getType(value) === 'RegExp') {
      lookup = null;
    } else if (isArray(value)) {
      for (i = 0, length = value.length; i < length; i++) {
        lookup[value[i]] = true;
      }
    } else {
      lookup[value] = true;
    }

    for (i = 0, length = data.length; i < length; i++) {
      /*jshint laxbreak: true */
      var _match = lookup && lookup[data[i]] !== undefined
        || !lookup && value.test(data[i]);
      /*jshint laxbreak: false */
      if (_match) {
        data.splice(i, 1);
        length--;
        i--;
      }
    }

    return data;
  }

  function arrayContains(list, value) {
    var i, length;

    // value may be string, number, array, regexp
    if (isArray(value)) {
      // Note: this can be optimized to O(n) (instead of current O(m * n))
      for (i = 0, length = value.length; i < length; i++) {
        if (!arrayContains(list, value[i])) {
          return false;
        }
      }

      return true;
    }

    var _type = getType(value);
    for (i = 0, length = list.length; i < length; i++) {
      if (_type === 'RegExp') {
        if (typeof list[i] === 'string' && list[i].match(value)) {
          return true;
        }
      } else if (list[i] === value) {
        return true;
      }
    }

    return false;
  }

  function arraysEqual(one, two) {
    if (!isArray(one) || !isArray(two)) {
      return false;
    }

    // arrays can't be equal if they have different amount of content
    if (one.length !== two.length) {
      return false;
    }

    one.sort();
    two.sort();

    for (var i = 0, l = one.length; i < l; i++) {
      if (one[i] !== two[i]) {
        return false;
      }
    }

    return true;
  }

  function trimSlashes(text) {
    var trim_expression = /^\/+|\/+$/g;
    return text.replace(trim_expression, '');
  }

  URI._parts = function() {
    return {
      protocol: null,
      username: null,
      password: null,
      hostname: null,
      urn: null,
      port: null,
      path: null,
      query: null,
      fragment: null,
      // state
      preventInvalidHostname: URI.preventInvalidHostname,
      duplicateQueryParameters: URI.duplicateQueryParameters,
      escapeQuerySpace: URI.escapeQuerySpace
    };
  };
  // state: throw on invalid hostname
  // see https://github.com/medialize/URI.js/pull/345
  // and https://github.com/medialize/URI.js/issues/354
  URI.preventInvalidHostname = false;
  // state: allow duplicate query parameters (a=1&a=1)
  URI.duplicateQueryParameters = false;
  // state: replaces + with %20 (space in query strings)
  URI.escapeQuerySpace = true;
  // static properties
  URI.protocol_expression = /^[a-z][a-z0-9.+-]*$/i;
  URI.idn_expression = /[^a-z0-9\._-]/i;
  URI.punycode_expression = /(xn--)/i;
  // well, 333.444.555.666 matches, but it sure ain't no IPv4 - do we care?
  URI.ip4_expression = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
  // credits to Rich Brown
  // source: http://forums.intermapper.com/viewtopic.php?p=1096#1096
  // specification: http://www.ietf.org/rfc/rfc4291.txt
  URI.ip6_expression = /^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/;
  // expression used is "gruber revised" (@gruber v2) determined to be the
  // best solution in a regex-golf we did a couple of ages ago at
  // * http://mathiasbynens.be/demo/url-regex
  // * http://rodneyrehm.de/t/url-regex.html
  URI.find_uri_expression = /\b((?:[a-z][\w-]+:(?:\/{1,3}|[a-z0-9%])|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?«»“”‘’]))/ig;
  URI.findUri = {
    // valid "scheme://" or "www."
    start: /\b(?:([a-z][a-z0-9.+-]*:\/\/)|www\.)/gi,
    // everything up to the next whitespace
    end: /[\s\r\n]|$/,
    // trim trailing punctuation captured by end RegExp
    trim: /[`!()\[\]{};:'".,<>?«»“”„‘’]+$/,
    // balanced parens inclusion (), [], {}, <>
    parens: /(\([^\)]*\)|\[[^\]]*\]|\{[^}]*\}|<[^>]*>)/g,
  };
  // http://www.iana.org/assignments/uri-schemes.html
  // http://en.wikipedia.org/wiki/List_of_TCP_and_UDP_port_numbers#Well-known_ports
  URI.defaultPorts = {
    http: '80',
    https: '443',
    ftp: '21',
    gopher: '70',
    ws: '80',
    wss: '443'
  };
  // list of protocols which always require a hostname
  URI.hostProtocols = [
    'http',
    'https'
  ];

  // allowed hostname characters according to RFC 3986
  // ALPHA DIGIT "-" "." "_" "~" "!" "$" "&" "'" "(" ")" "*" "+" "," ";" "=" %encoded
  // I've never seen a (non-IDN) hostname other than: ALPHA DIGIT . - _
  URI.invalid_hostname_characters = /[^a-zA-Z0-9\.\-:_]/;
  // map DOM Elements to their URI attribute
  URI.domAttributes = {
    'a': 'href',
    'blockquote': 'cite',
    'link': 'href',
    'base': 'href',
    'script': 'src',
    'form': 'action',
    'img': 'src',
    'area': 'href',
    'iframe': 'src',
    'embed': 'src',
    'source': 'src',
    'track': 'src',
    'input': 'src', // but only if type="image"
    'audio': 'src',
    'video': 'src'
  };
  URI.getDomAttribute = function(node) {
    if (!node || !node.nodeName) {
      return undefined;
    }

    var nodeName = node.nodeName.toLowerCase();
    // <input> should only expose src for type="image"
    if (nodeName === 'input' && node.type !== 'image') {
      return undefined;
    }

    return URI.domAttributes[nodeName];
  };

  function escapeForDumbFirefox36(value) {
    // https://github.com/medialize/URI.js/issues/91
    return escape(value);
  }

  // encoding / decoding according to RFC3986
  function strictEncodeURIComponent(string) {
    // see https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/encodeURIComponent
    return encodeURIComponent(string)
      .replace(/[!'()*]/g, escapeForDumbFirefox36)
      .replace(/\*/g, '%2A');
  }
  URI.encode = strictEncodeURIComponent;
  URI.decode = decodeURIComponent;
  URI.iso8859 = function() {
    URI.encode = escape;
    URI.decode = unescape;
  };
  URI.unicode = function() {
    URI.encode = strictEncodeURIComponent;
    URI.decode = decodeURIComponent;
  };
  URI.characters = {
    pathname: {
      encode: {
        // RFC3986 2.1: For consistency, URI producers and normalizers should
        // use uppercase hexadecimal digits for all percent-encodings.
        expression: /%(24|26|2B|2C|3B|3D|3A|40)/ig,
        map: {
          // -._~!'()*
          '%24': '$',
          '%26': '&',
          '%2B': '+',
          '%2C': ',',
          '%3B': ';',
          '%3D': '=',
          '%3A': ':',
          '%40': '@'
        }
      },
      decode: {
        expression: /[\/\?#]/g,
        map: {
          '/': '%2F',
          '?': '%3F',
          '#': '%23'
        }
      }
    },
    reserved: {
      encode: {
        // RFC3986 2.1: For consistency, URI producers and normalizers should
        // use uppercase hexadecimal digits for all percent-encodings.
        expression: /%(21|23|24|26|27|28|29|2A|2B|2C|2F|3A|3B|3D|3F|40|5B|5D)/ig,
        map: {
          // gen-delims
          '%3A': ':',
          '%2F': '/',
          '%3F': '?',
          '%23': '#',
          '%5B': '[',
          '%5D': ']',
          '%40': '@',
          // sub-delims
          '%21': '!',
          '%24': '$',
          '%26': '&',
          '%27': '\'',
          '%28': '(',
          '%29': ')',
          '%2A': '*',
          '%2B': '+',
          '%2C': ',',
          '%3B': ';',
          '%3D': '='
        }
      }
    },
    urnpath: {
      // The characters under `encode` are the characters called out by RFC 2141 as being acceptable
      // for usage in a URN. RFC2141 also calls out "-", ".", and "_" as acceptable characters, but
      // these aren't encoded by encodeURIComponent, so we don't have to call them out here. Also
      // note that the colon character is not featured in the encoding map; this is because URI.js
      // gives the colons in URNs semantic meaning as the delimiters of path segements, and so it
      // should not appear unencoded in a segment itself.
      // See also the note above about RFC3986 and capitalalized hex digits.
      encode: {
        expression: /%(21|24|27|28|29|2A|2B|2C|3B|3D|40)/ig,
        map: {
          '%21': '!',
          '%24': '$',
          '%27': '\'',
          '%28': '(',
          '%29': ')',
          '%2A': '*',
          '%2B': '+',
          '%2C': ',',
          '%3B': ';',
          '%3D': '=',
          '%40': '@'
        }
      },
      // These characters are the characters called out by RFC2141 as "reserved" characters that
      // should never appear in a URN, plus the colon character (see note above).
      decode: {
        expression: /[\/\?#:]/g,
        map: {
          '/': '%2F',
          '?': '%3F',
          '#': '%23',
          ':': '%3A'
        }
      }
    }
  };
  URI.encodeQuery = function(string, escapeQuerySpace) {
    var escaped = URI.encode(string + '');
    if (escapeQuerySpace === undefined) {
      escapeQuerySpace = URI.escapeQuerySpace;
    }

    return escapeQuerySpace ? escaped.replace(/%20/g, '+') : escaped;
  };
  URI.decodeQuery = function(string, escapeQuerySpace) {
    string += '';
    if (escapeQuerySpace === undefined) {
      escapeQuerySpace = URI.escapeQuerySpace;
    }

    try {
      return URI.decode(escapeQuerySpace ? string.replace(/\+/g, '%20') : string);
    } catch(e) {
      // we're not going to mess with weird encodings,
      // give up and return the undecoded original string
      // see https://github.com/medialize/URI.js/issues/87
      // see https://github.com/medialize/URI.js/issues/92
      return string;
    }
  };
  // generate encode/decode path functions
  var _parts = {'encode':'encode', 'decode':'decode'};
  var _part;
  var generateAccessor = function(_group, _part) {
    return function(string) {
      try {
        return URI[_part](string + '').replace(URI.characters[_group][_part].expression, function(c) {
          return URI.characters[_group][_part].map[c];
        });
      } catch (e) {
        // we're not going to mess with weird encodings,
        // give up and return the undecoded original string
        // see https://github.com/medialize/URI.js/issues/87
        // see https://github.com/medialize/URI.js/issues/92
        return string;
      }
    };
  };

  for (_part in _parts) {
    URI[_part + 'PathSegment'] = generateAccessor('pathname', _parts[_part]);
    URI[_part + 'UrnPathSegment'] = generateAccessor('urnpath', _parts[_part]);
  }

  var generateSegmentedPathFunction = function(_sep, _codingFuncName, _innerCodingFuncName) {
    return function(string) {
      // Why pass in names of functions, rather than the function objects themselves? The
      // definitions of some functions (but in particular, URI.decode) will occasionally change due
      // to URI.js having ISO8859 and Unicode modes. Passing in the name and getting it will ensure
      // that the functions we use here are "fresh".
      var actualCodingFunc;
      if (!_innerCodingFuncName) {
        actualCodingFunc = URI[_codingFuncName];
      } else {
        actualCodingFunc = function(string) {
          return URI[_codingFuncName](URI[_innerCodingFuncName](string));
        };
      }

      var segments = (string + '').split(_sep);

      for (var i = 0, length = segments.length; i < length; i++) {
        segments[i] = actualCodingFunc(segments[i]);
      }

      return segments.join(_sep);
    };
  };

  // This takes place outside the above loop because we don't want, e.g., encodeUrnPath functions.
  URI.decodePath = generateSegmentedPathFunction('/', 'decodePathSegment');
  URI.decodeUrnPath = generateSegmentedPathFunction(':', 'decodeUrnPathSegment');
  URI.recodePath = generateSegmentedPathFunction('/', 'encodePathSegment', 'decode');
  URI.recodeUrnPath = generateSegmentedPathFunction(':', 'encodeUrnPathSegment', 'decode');

  URI.encodeReserved = generateAccessor('reserved', 'encode');

  URI.parse = function(string, parts) {
    var pos;
    if (!parts) {
      parts = {
        preventInvalidHostname: URI.preventInvalidHostname
      };
    }
    // [protocol"://"[username[":"password]"@"]hostname[":"port]"/"?][path]["?"querystring]["#"fragment]

    // extract fragment
    pos = string.indexOf('#');
    if (pos > -1) {
      // escaping?
      parts.fragment = string.substring(pos + 1) || null;
      string = string.substring(0, pos);
    }

    // extract query
    pos = string.indexOf('?');
    if (pos > -1) {
      // escaping?
      parts.query = string.substring(pos + 1) || null;
      string = string.substring(0, pos);
    }

    // extract protocol
    if (string.substring(0, 2) === '//') {
      // relative-scheme
      parts.protocol = null;
      string = string.substring(2);
      // extract "user:pass@host:port"
      string = URI.parseAuthority(string, parts);
    } else {
      pos = string.indexOf(':');
      if (pos > -1) {
        parts.protocol = string.substring(0, pos) || null;
        if (parts.protocol && !parts.protocol.match(URI.protocol_expression)) {
          // : may be within the path
          parts.protocol = undefined;
        } else if (string.substring(pos + 1, pos + 3) === '//') {
          string = string.substring(pos + 3);

          // extract "user:pass@host:port"
          string = URI.parseAuthority(string, parts);
        } else {
          string = string.substring(pos + 1);
          parts.urn = true;
        }
      }
    }

    // what's left must be the path
    parts.path = string;

    // and we're done
    return parts;
  };
  URI.parseHost = function(string, parts) {
    if (!string) {
      string = '';
    }

    // Copy chrome, IE, opera backslash-handling behavior.
    // Back slashes before the query string get converted to forward slashes
    // See: https://github.com/joyent/node/blob/386fd24f49b0e9d1a8a076592a404168faeecc34/lib/url.js#L115-L124
    // See: https://code.google.com/p/chromium/issues/detail?id=25916
    // https://github.com/medialize/URI.js/pull/233
    string = string.replace(/\\/g, '/');

    // extract host:port
    var pos = string.indexOf('/');
    var bracketPos;
    var t;

    if (pos === -1) {
      pos = string.length;
    }

    if (string.charAt(0) === '[') {
      // IPv6 host - http://tools.ietf.org/html/draft-ietf-6man-text-addr-representation-04#section-6
      // I claim most client software breaks on IPv6 anyways. To simplify things, URI only accepts
      // IPv6+port in the format [2001:db8::1]:80 (for the time being)
      bracketPos = string.indexOf(']');
      parts.hostname = string.substring(1, bracketPos) || null;
      parts.port = string.substring(bracketPos + 2, pos) || null;
      if (parts.port === '/') {
        parts.port = null;
      }
    } else {
      var firstColon = string.indexOf(':');
      var firstSlash = string.indexOf('/');
      var nextColon = string.indexOf(':', firstColon + 1);
      if (nextColon !== -1 && (firstSlash === -1 || nextColon < firstSlash)) {
        // IPv6 host contains multiple colons - but no port
        // this notation is actually not allowed by RFC 3986, but we're a liberal parser
        parts.hostname = string.substring(0, pos) || null;
        parts.port = null;
      } else {
        t = string.substring(0, pos).split(':');
        parts.hostname = t[0] || null;
        parts.port = t[1] || null;
      }
    }

    if (parts.hostname && string.substring(pos).charAt(0) !== '/') {
      pos++;
      string = '/' + string;
    }

    if (parts.preventInvalidHostname) {
      URI.ensureValidHostname(parts.hostname, parts.protocol);
    }

    if (parts.port) {
      URI.ensureValidPort(parts.port);
    }

    return string.substring(pos) || '/';
  };
  URI.parseAuthority = function(string, parts) {
    string = URI.parseUserinfo(string, parts);
    return URI.parseHost(string, parts);
  };
  URI.parseUserinfo = function(string, parts) {
    // extract username:password
    var firstSlash = string.indexOf('/');
    var pos = string.lastIndexOf('@', firstSlash > -1 ? firstSlash : string.length - 1);
    var t;

    // authority@ must come before /path
    if (pos > -1 && (firstSlash === -1 || pos < firstSlash)) {
      t = string.substring(0, pos).split(':');
      parts.username = t[0] ? URI.decode(t[0]) : null;
      t.shift();
      parts.password = t[0] ? URI.decode(t.join(':')) : null;
      string = string.substring(pos + 1);
    } else {
      parts.username = null;
      parts.password = null;
    }

    return string;
  };
  URI.parseQuery = function(string, escapeQuerySpace) {
    if (!string) {
      return {};
    }

    // throw out the funky business - "?"[name"="value"&"]+
    string = string.replace(/&+/g, '&').replace(/^\?*&*|&+$/g, '');

    if (!string) {
      return {};
    }

    var items = {};
    var splits = string.split('&');
    var length = splits.length;
    var v, name, value;

    for (var i = 0; i < length; i++) {
      v = splits[i].split('=');
      name = URI.decodeQuery(v.shift(), escapeQuerySpace);
      // no "=" is null according to http://dvcs.w3.org/hg/url/raw-file/tip/Overview.html#collect-url-parameters
      value = v.length ? URI.decodeQuery(v.join('='), escapeQuerySpace) : null;

      if (hasOwn.call(items, name)) {
        if (typeof items[name] === 'string' || items[name] === null) {
          items[name] = [items[name]];
        }

        items[name].push(value);
      } else {
        items[name] = value;
      }
    }

    return items;
  };

  URI.build = function(parts) {
    var t = '';

    if (parts.protocol) {
      t += parts.protocol + ':';
    }

    if (!parts.urn && (t || parts.hostname)) {
      t += '//';
    }

    t += (URI.buildAuthority(parts) || '');

    if (typeof parts.path === 'string') {
      if (parts.path.charAt(0) !== '/' && typeof parts.hostname === 'string') {
        t += '/';
      }

      t += parts.path;
    }

    if (typeof parts.query === 'string' && parts.query) {
      t += '?' + parts.query;
    }

    if (typeof parts.fragment === 'string' && parts.fragment) {
      t += '#' + parts.fragment;
    }
    return t;
  };
  URI.buildHost = function(parts) {
    var t = '';

    if (!parts.hostname) {
      return '';
    } else if (URI.ip6_expression.test(parts.hostname)) {
      t += '[' + parts.hostname + ']';
    } else {
      t += parts.hostname;
    }

    if (parts.port) {
      t += ':' + parts.port;
    }

    return t;
  };
  URI.buildAuthority = function(parts) {
    return URI.buildUserinfo(parts) + URI.buildHost(parts);
  };
  URI.buildUserinfo = function(parts) {
    var t = '';

    if (parts.username) {
      t += URI.encode(parts.username);
    }

    if (parts.password) {
      t += ':' + URI.encode(parts.password);
    }

    if (t) {
      t += '@';
    }

    return t;
  };
  URI.buildQuery = function(data, duplicateQueryParameters, escapeQuerySpace) {
    // according to http://tools.ietf.org/html/rfc3986 or http://labs.apache.org/webarch/uri/rfc/rfc3986.html
    // being »-._~!$&'()*+,;=:@/?« %HEX and alnum are allowed
    // the RFC explicitly states ?/foo being a valid use case, no mention of parameter syntax!
    // URI.js treats the query string as being application/x-www-form-urlencoded
    // see http://www.w3.org/TR/REC-html40/interact/forms.html#form-content-type

    var t = '';
    var unique, key, i, length;
    for (key in data) {
      if (hasOwn.call(data, key) && key) {
        if (isArray(data[key])) {
          unique = {};
          for (i = 0, length = data[key].length; i < length; i++) {
            if (data[key][i] !== undefined && unique[data[key][i] + ''] === undefined) {
              t += '&' + URI.buildQueryParameter(key, data[key][i], escapeQuerySpace);
              if (duplicateQueryParameters !== true) {
                unique[data[key][i] + ''] = true;
              }
            }
          }
        } else if (data[key] !== undefined) {
          t += '&' + URI.buildQueryParameter(key, data[key], escapeQuerySpace);
        }
      }
    }

    return t.substring(1);
  };
  URI.buildQueryParameter = function(name, value, escapeQuerySpace) {
    // http://www.w3.org/TR/REC-html40/interact/forms.html#form-content-type -- application/x-www-form-urlencoded
    // don't append "=" for null values, according to http://dvcs.w3.org/hg/url/raw-file/tip/Overview.html#url-parameter-serialization
    return URI.encodeQuery(name, escapeQuerySpace) + (value !== null ? '=' + URI.encodeQuery(value, escapeQuerySpace) : '');
  };

  URI.addQuery = function(data, name, value) {
    if (typeof name === 'object') {
      for (var key in name) {
        if (hasOwn.call(name, key)) {
          URI.addQuery(data, key, name[key]);
        }
      }
    } else if (typeof name === 'string') {
      if (data[name] === undefined) {
        data[name] = value;
        return;
      } else if (typeof data[name] === 'string') {
        data[name] = [data[name]];
      }

      if (!isArray(value)) {
        value = [value];
      }

      data[name] = (data[name] || []).concat(value);
    } else {
      throw new TypeError('URI.addQuery() accepts an object, string as the name parameter');
    }
  };

  URI.setQuery = function(data, name, value) {
    if (typeof name === 'object') {
      for (var key in name) {
        if (hasOwn.call(name, key)) {
          URI.setQuery(data, key, name[key]);
        }
      }
    } else if (typeof name === 'string') {
      data[name] = value === undefined ? null : value;
    } else {
      throw new TypeError('URI.setQuery() accepts an object, string as the name parameter');
    }
  };

  URI.removeQuery = function(data, name, value) {
    var i, length, key;

    if (isArray(name)) {
      for (i = 0, length = name.length; i < length; i++) {
        data[name[i]] = undefined;
      }
    } else if (getType(name) === 'RegExp') {
      for (key in data) {
        if (name.test(key)) {
          data[key] = undefined;
        }
      }
    } else if (typeof name === 'object') {
      for (key in name) {
        if (hasOwn.call(name, key)) {
          URI.removeQuery(data, key, name[key]);
        }
      }
    } else if (typeof name === 'string') {
      if (value !== undefined) {
        if (getType(value) === 'RegExp') {
          if (!isArray(data[name]) && value.test(data[name])) {
            data[name] = undefined;
          } else {
            data[name] = filterArrayValues(data[name], value);
          }
        } else if (data[name] === String(value) && (!isArray(value) || value.length === 1)) {
          data[name] = undefined;
        } else if (isArray(data[name])) {
          data[name] = filterArrayValues(data[name], value);
        }
      } else {
        data[name] = undefined;
      }
    } else {
      throw new TypeError('URI.removeQuery() accepts an object, string, RegExp as the first parameter');
    }
  };
  URI.hasQuery = function(data, name, value, withinArray) {
    switch (getType(name)) {
      case 'String':
        // Nothing to do here
        break;

      case 'RegExp':
        for (var key in data) {
          if (hasOwn.call(data, key)) {
            if (name.test(key) && (value === undefined || URI.hasQuery(data, key, value))) {
              return true;
            }
          }
        }

        return false;

      case 'Object':
        for (var _key in name) {
          if (hasOwn.call(name, _key)) {
            if (!URI.hasQuery(data, _key, name[_key])) {
              return false;
            }
          }
        }

        return true;

      default:
        throw new TypeError('URI.hasQuery() accepts a string, regular expression or object as the name parameter');
    }

    switch (getType(value)) {
      case 'Undefined':
        // true if exists (but may be empty)
        return name in data; // data[name] !== undefined;

      case 'Boolean':
        // true if exists and non-empty
        var _booly = Boolean(isArray(data[name]) ? data[name].length : data[name]);
        return value === _booly;

      case 'Function':
        // allow complex comparison
        return !!value(data[name], name, data);

      case 'Array':
        if (!isArray(data[name])) {
          return false;
        }

        var op = withinArray ? arrayContains : arraysEqual;
        return op(data[name], value);

      case 'RegExp':
        if (!isArray(data[name])) {
          return Boolean(data[name] && data[name].match(value));
        }

        if (!withinArray) {
          return false;
        }

        return arrayContains(data[name], value);

      case 'Number':
        value = String(value);
        /* falls through */
      case 'String':
        if (!isArray(data[name])) {
          return data[name] === value;
        }

        if (!withinArray) {
          return false;
        }

        return arrayContains(data[name], value);

      default:
        throw new TypeError('URI.hasQuery() accepts undefined, boolean, string, number, RegExp, Function as the value parameter');
    }
  };


  URI.joinPaths = function() {
    var input = [];
    var segments = [];
    var nonEmptySegments = 0;

    for (var i = 0; i < arguments.length; i++) {
      var url = new URI(arguments[i]);
      input.push(url);
      var _segments = url.segment();
      for (var s = 0; s < _segments.length; s++) {
        if (typeof _segments[s] === 'string') {
          segments.push(_segments[s]);
        }

        if (_segments[s]) {
          nonEmptySegments++;
        }
      }
    }

    if (!segments.length || !nonEmptySegments) {
      return new URI('');
    }

    var uri = new URI('').segment(segments);

    if (input[0].path() === '' || input[0].path().slice(0, 1) === '/') {
      uri.path('/' + uri.path());
    }

    return uri.normalize();
  };

  URI.commonPath = function(one, two) {
    var length = Math.min(one.length, two.length);
    var pos;

    // find first non-matching character
    for (pos = 0; pos < length; pos++) {
      if (one.charAt(pos) !== two.charAt(pos)) {
        pos--;
        break;
      }
    }

    if (pos < 1) {
      return one.charAt(0) === two.charAt(0) && one.charAt(0) === '/' ? '/' : '';
    }

    // revert to last /
    if (one.charAt(pos) !== '/' || two.charAt(pos) !== '/') {
      pos = one.substring(0, pos).lastIndexOf('/');
    }

    return one.substring(0, pos + 1);
  };

  URI.withinString = function(string, callback, options) {
    options || (options = {});
    var _start = options.start || URI.findUri.start;
    var _end = options.end || URI.findUri.end;
    var _trim = options.trim || URI.findUri.trim;
    var _parens = options.parens || URI.findUri.parens;
    var _attributeOpen = /[a-z0-9-]=["']?$/i;

    _start.lastIndex = 0;
    while (true) {
      var match = _start.exec(string);
      if (!match) {
        break;
      }

      var start = match.index;
      if (options.ignoreHtml) {
        // attribut(e=["']?$)
        var attributeOpen = string.slice(Math.max(start - 3, 0), start);
        if (attributeOpen && _attributeOpen.test(attributeOpen)) {
          continue;
        }
      }

      var end = start + string.slice(start).search(_end);
      var slice = string.slice(start, end);
      // make sure we include well balanced parens
      var parensEnd = -1;
      while (true) {
        var parensMatch = _parens.exec(slice);
        if (!parensMatch) {
          break;
        }

        var parensMatchEnd = parensMatch.index + parensMatch[0].length;
        parensEnd = Math.max(parensEnd, parensMatchEnd);
      }

      if (parensEnd > -1) {
        slice = slice.slice(0, parensEnd) + slice.slice(parensEnd).replace(_trim, '');
      } else {
        slice = slice.replace(_trim, '');
      }

      if (slice.length <= match[0].length) {
        // the extract only contains the starting marker of a URI,
        // e.g. "www" or "http://"
        continue;
      }

      if (options.ignore && options.ignore.test(slice)) {
        continue;
      }

      end = start + slice.length;
      var result = callback(slice, start, end, string);
      if (result === undefined) {
        _start.lastIndex = end;
        continue;
      }

      result = String(result);
      string = string.slice(0, start) + result + string.slice(end);
      _start.lastIndex = start + result.length;
    }

    _start.lastIndex = 0;
    return string;
  };

  URI.ensureValidHostname = function(v, protocol) {
    // Theoretically URIs allow percent-encoding in Hostnames (according to RFC 3986)
    // they are not part of DNS and therefore ignored by URI.js

    var hasHostname = !!v; // not null and not an empty string
    var hasProtocol = !!protocol;
    var rejectEmptyHostname = false;

    if (hasProtocol) {
      rejectEmptyHostname = arrayContains(URI.hostProtocols, protocol);
    }

    if (rejectEmptyHostname && !hasHostname) {
      throw new TypeError('Hostname cannot be empty, if protocol is ' + protocol);
    } else if (v && v.match(URI.invalid_hostname_characters)) {
      // test punycode
      if (!punycode) {
        throw new TypeError('Hostname "' + v + '" contains characters other than [A-Z0-9.-:_] and Punycode.js is not available');
      }
      if (punycode.toASCII(v).match(URI.invalid_hostname_characters)) {
        throw new TypeError('Hostname "' + v + '" contains characters other than [A-Z0-9.-:_]');
      }
    }
  };

  URI.ensureValidPort = function (v) {
    if (!v) {
      return;
    }

    var port = Number(v);
    if (isInteger(port) && (port > 0) && (port < 65536)) {
      return;
    }

    throw new TypeError('Port "' + v + '" is not a valid port');
  };

  // noConflict
  URI.noConflict = function(removeAll) {
    if (removeAll) {
      var unconflicted = {
        URI: this.noConflict()
      };

      if (root.URITemplate && typeof root.URITemplate.noConflict === 'function') {
        unconflicted.URITemplate = root.URITemplate.noConflict();
      }

      if (root.IPv6 && typeof root.IPv6.noConflict === 'function') {
        unconflicted.IPv6 = root.IPv6.noConflict();
      }

      if (root.SecondLevelDomains && typeof root.SecondLevelDomains.noConflict === 'function') {
        unconflicted.SecondLevelDomains = root.SecondLevelDomains.noConflict();
      }

      return unconflicted;
    } else if (root.URI === this) {
      root.URI = _URI;
    }

    return this;
  };

  p.build = function(deferBuild) {
    if (deferBuild === true) {
      this._deferred_build = true;
    } else if (deferBuild === undefined || this._deferred_build) {
      this._string = URI.build(this._parts);
      this._deferred_build = false;
    }

    return this;
  };

  p.clone = function() {
    return new URI(this);
  };

  p.valueOf = p.toString = function() {
    return this.build(false)._string;
  };


  function generateSimpleAccessor(_part){
    return function(v, build) {
      if (v === undefined) {
        return this._parts[_part] || '';
      } else {
        this._parts[_part] = v || null;
        this.build(!build);
        return this;
      }
    };
  }

  function generatePrefixAccessor(_part, _key){
    return function(v, build) {
      if (v === undefined) {
        return this._parts[_part] || '';
      } else {
        if (v !== null) {
          v = v + '';
          if (v.charAt(0) === _key) {
            v = v.substring(1);
          }
        }

        this._parts[_part] = v;
        this.build(!build);
        return this;
      }
    };
  }

  p.protocol = generateSimpleAccessor('protocol');
  p.username = generateSimpleAccessor('username');
  p.password = generateSimpleAccessor('password');
  p.hostname = generateSimpleAccessor('hostname');
  p.port = generateSimpleAccessor('port');
  p.query = generatePrefixAccessor('query', '?');
  p.fragment = generatePrefixAccessor('fragment', '#');

  p.search = function(v, build) {
    var t = this.query(v, build);
    return typeof t === 'string' && t.length ? ('?' + t) : t;
  };
  p.hash = function(v, build) {
    var t = this.fragment(v, build);
    return typeof t === 'string' && t.length ? ('#' + t) : t;
  };

  p.pathname = function(v, build) {
    if (v === undefined || v === true) {
      var res = this._parts.path || (this._parts.hostname ? '/' : '');
      return v ? (this._parts.urn ? URI.decodeUrnPath : URI.decodePath)(res) : res;
    } else {
      if (this._parts.urn) {
        this._parts.path = v ? URI.recodeUrnPath(v) : '';
      } else {
        this._parts.path = v ? URI.recodePath(v) : '/';
      }
      this.build(!build);
      return this;
    }
  };
  p.path = p.pathname;
  p.href = function(href, build) {
    var key;

    if (href === undefined) {
      return this.toString();
    }

    this._string = '';
    this._parts = URI._parts();

    var _URI = href instanceof URI;
    var _object = typeof href === 'object' && (href.hostname || href.path || href.pathname);
    if (href.nodeName) {
      var attribute = URI.getDomAttribute(href);
      href = href[attribute] || '';
      _object = false;
    }

    // window.location is reported to be an object, but it's not the sort
    // of object we're looking for:
    // * location.protocol ends with a colon
    // * location.query != object.search
    // * location.hash != object.fragment
    // simply serializing the unknown object should do the trick
    // (for location, not for everything...)
    if (!_URI && _object && href.pathname !== undefined) {
      href = href.toString();
    }

    if (typeof href === 'string' || href instanceof String) {
      this._parts = URI.parse(String(href), this._parts);
    } else if (_URI || _object) {
      var src = _URI ? href._parts : href;
      for (key in src) {
        if (key === 'query') { continue; }
        if (hasOwn.call(this._parts, key)) {
          this._parts[key] = src[key];
        }
      }
      if (src.query) {
        this.query(src.query, false);
      }
    } else {
      throw new TypeError('invalid input');
    }

    this.build(!build);
    return this;
  };

  // identification accessors
  p.is = function(what) {
    var ip = false;
    var ip4 = false;
    var ip6 = false;
    var name = false;
    var sld = false;
    var idn = false;
    var punycode = false;
    var relative = !this._parts.urn;

    if (this._parts.hostname) {
      relative = false;
      ip4 = URI.ip4_expression.test(this._parts.hostname);
      ip6 = URI.ip6_expression.test(this._parts.hostname);
      ip = ip4 || ip6;
      name = !ip;
      sld = name && SLD && SLD.has(this._parts.hostname);
      idn = name && URI.idn_expression.test(this._parts.hostname);
      punycode = name && URI.punycode_expression.test(this._parts.hostname);
    }

    switch (what.toLowerCase()) {
      case 'relative':
        return relative;

      case 'absolute':
        return !relative;

      // hostname identification
      case 'domain':
      case 'name':
        return name;

      case 'sld':
        return sld;

      case 'ip':
        return ip;

      case 'ip4':
      case 'ipv4':
      case 'inet4':
        return ip4;

      case 'ip6':
      case 'ipv6':
      case 'inet6':
        return ip6;

      case 'idn':
        return idn;

      case 'url':
        return !this._parts.urn;

      case 'urn':
        return !!this._parts.urn;

      case 'punycode':
        return punycode;
    }

    return null;
  };

  // component specific input validation
  var _protocol = p.protocol;
  var _port = p.port;
  var _hostname = p.hostname;

  p.protocol = function(v, build) {
    if (v) {
      // accept trailing ://
      v = v.replace(/:(\/\/)?$/, '');

      if (!v.match(URI.protocol_expression)) {
        throw new TypeError('Protocol "' + v + '" contains characters other than [A-Z0-9.+-] or doesn\'t start with [A-Z]');
      }
    }

    return _protocol.call(this, v, build);
  };
  p.scheme = p.protocol;
  p.port = function(v, build) {
    if (this._parts.urn) {
      return v === undefined ? '' : this;
    }

    if (v !== undefined) {
      if (v === 0) {
        v = null;
      }

      if (v) {
        v += '';
        if (v.charAt(0) === ':') {
          v = v.substring(1);
        }

        URI.ensureValidPort(v);
      }
    }
    return _port.call(this, v, build);
  };
  p.hostname = function(v, build) {
    if (this._parts.urn) {
      return v === undefined ? '' : this;
    }

    if (v !== undefined) {
      var x = { preventInvalidHostname: this._parts.preventInvalidHostname };
      var res = URI.parseHost(v, x);
      if (res !== '/') {
        throw new TypeError('Hostname "' + v + '" contains characters other than [A-Z0-9.-]');
      }

      v = x.hostname;
      if (this._parts.preventInvalidHostname) {
        URI.ensureValidHostname(v, this._parts.protocol);
      }
    }

    return _hostname.call(this, v, build);
  };

  // compound accessors
  p.origin = function(v, build) {
    if (this._parts.urn) {
      return v === undefined ? '' : this;
    }

    if (v === undefined) {
      var protocol = this.protocol();
      var authority = this.authority();
      if (!authority) {
        return '';
      }

      return (protocol ? protocol + '://' : '') + this.authority();
    } else {
      var origin = URI(v);
      this
        .protocol(origin.protocol())
        .authority(origin.authority())
        .build(!build);
      return this;
    }
  };
  p.host = function(v, build) {
    if (this._parts.urn) {
      return v === undefined ? '' : this;
    }

    if (v === undefined) {
      return this._parts.hostname ? URI.buildHost(this._parts) : '';
    } else {
      var res = URI.parseHost(v, this._parts);
      if (res !== '/') {
        throw new TypeError('Hostname "' + v + '" contains characters other than [A-Z0-9.-]');
      }

      this.build(!build);
      return this;
    }
  };
  p.authority = function(v, build) {
    if (this._parts.urn) {
      return v === undefined ? '' : this;
    }

    if (v === undefined) {
      return this._parts.hostname ? URI.buildAuthority(this._parts) : '';
    } else {
      var res = URI.parseAuthority(v, this._parts);
      if (res !== '/') {
        throw new TypeError('Hostname "' + v + '" contains characters other than [A-Z0-9.-]');
      }

      this.build(!build);
      return this;
    }
  };
  p.userinfo = function(v, build) {
    if (this._parts.urn) {
      return v === undefined ? '' : this;
    }

    if (v === undefined) {
      var t = URI.buildUserinfo(this._parts);
      return t ? t.substring(0, t.length -1) : t;
    } else {
      if (v[v.length-1] !== '@') {
        v += '@';
      }

      URI.parseUserinfo(v, this._parts);
      this.build(!build);
      return this;
    }
  };
  p.resource = function(v, build) {
    var parts;

    if (v === undefined) {
      return this.path() + this.search() + this.hash();
    }

    parts = URI.parse(v);
    this._parts.path = parts.path;
    this._parts.query = parts.query;
    this._parts.fragment = parts.fragment;
    this.build(!build);
    return this;
  };

  // fraction accessors
  p.subdomain = function(v, build) {
    if (this._parts.urn) {
      return v === undefined ? '' : this;
    }

    // convenience, return "www" from "www.example.org"
    if (v === undefined) {
      if (!this._parts.hostname || this.is('IP')) {
        return '';
      }

      // grab domain and add another segment
      var end = this._parts.hostname.length - this.domain().length - 1;
      return this._parts.hostname.substring(0, end) || '';
    } else {
      var e = this._parts.hostname.length - this.domain().length;
      var sub = this._parts.hostname.substring(0, e);
      var replace = new RegExp('^' + escapeRegEx(sub));

      if (v && v.charAt(v.length - 1) !== '.') {
        v += '.';
      }

      if (v.indexOf(':') !== -1) {
        throw new TypeError('Domains cannot contain colons');
      }

      if (v) {
        URI.ensureValidHostname(v, this._parts.protocol);
      }

      this._parts.hostname = this._parts.hostname.replace(replace, v);
      this.build(!build);
      return this;
    }
  };
  p.domain = function(v, build) {
    if (this._parts.urn) {
      return v === undefined ? '' : this;
    }

    if (typeof v === 'boolean') {
      build = v;
      v = undefined;
    }

    // convenience, return "example.org" from "www.example.org"
    if (v === undefined) {
      if (!this._parts.hostname || this.is('IP')) {
        return '';
      }

      // if hostname consists of 1 or 2 segments, it must be the domain
      var t = this._parts.hostname.match(/\./g);
      if (t && t.length < 2) {
        return this._parts.hostname;
      }

      // grab tld and add another segment
      var end = this._parts.hostname.length - this.tld(build).length - 1;
      end = this._parts.hostname.lastIndexOf('.', end -1) + 1;
      return this._parts.hostname.substring(end) || '';
    } else {
      if (!v) {
        throw new TypeError('cannot set domain empty');
      }

      if (v.indexOf(':') !== -1) {
        throw new TypeError('Domains cannot contain colons');
      }

      URI.ensureValidHostname(v, this._parts.protocol);

      if (!this._parts.hostname || this.is('IP')) {
        this._parts.hostname = v;
      } else {
        var replace = new RegExp(escapeRegEx(this.domain()) + '$');
        this._parts.hostname = this._parts.hostname.replace(replace, v);
      }

      this.build(!build);
      return this;
    }
  };
  p.tld = function(v, build) {
    if (this._parts.urn) {
      return v === undefined ? '' : this;
    }

    if (typeof v === 'boolean') {
      build = v;
      v = undefined;
    }

    // return "org" from "www.example.org"
    if (v === undefined) {
      if (!this._parts.hostname || this.is('IP')) {
        return '';
      }

      var pos = this._parts.hostname.lastIndexOf('.');
      var tld = this._parts.hostname.substring(pos + 1);

      if (build !== true && SLD && SLD.list[tld.toLowerCase()]) {
        return SLD.get(this._parts.hostname) || tld;
      }

      return tld;
    } else {
      var replace;

      if (!v) {
        throw new TypeError('cannot set TLD empty');
      } else if (v.match(/[^a-zA-Z0-9-]/)) {
        if (SLD && SLD.is(v)) {
          replace = new RegExp(escapeRegEx(this.tld()) + '$');
          this._parts.hostname = this._parts.hostname.replace(replace, v);
        } else {
          throw new TypeError('TLD "' + v + '" contains characters other than [A-Z0-9]');
        }
      } else if (!this._parts.hostname || this.is('IP')) {
        throw new ReferenceError('cannot set TLD on non-domain host');
      } else {
        replace = new RegExp(escapeRegEx(this.tld()) + '$');
        this._parts.hostname = this._parts.hostname.replace(replace, v);
      }

      this.build(!build);
      return this;
    }
  };
  p.directory = function(v, build) {
    if (this._parts.urn) {
      return v === undefined ? '' : this;
    }

    if (v === undefined || v === true) {
      if (!this._parts.path && !this._parts.hostname) {
        return '';
      }

      if (this._parts.path === '/') {
        return '/';
      }

      var end = this._parts.path.length - this.filename().length - 1;
      var res = this._parts.path.substring(0, end) || (this._parts.hostname ? '/' : '');

      return v ? URI.decodePath(res) : res;

    } else {
      var e = this._parts.path.length - this.filename().length;
      var directory = this._parts.path.substring(0, e);
      var replace = new RegExp('^' + escapeRegEx(directory));

      // fully qualifier directories begin with a slash
      if (!this.is('relative')) {
        if (!v) {
          v = '/';
        }

        if (v.charAt(0) !== '/') {
          v = '/' + v;
        }
      }

      // directories always end with a slash
      if (v && v.charAt(v.length - 1) !== '/') {
        v += '/';
      }

      v = URI.recodePath(v);
      this._parts.path = this._parts.path.replace(replace, v);
      this.build(!build);
      return this;
    }
  };
  p.filename = function(v, build) {
    if (this._parts.urn) {
      return v === undefined ? '' : this;
    }

    if (typeof v !== 'string') {
      if (!this._parts.path || this._parts.path === '/') {
        return '';
      }

      var pos = this._parts.path.lastIndexOf('/');
      var res = this._parts.path.substring(pos+1);

      return v ? URI.decodePathSegment(res) : res;
    } else {
      var mutatedDirectory = false;

      if (v.charAt(0) === '/') {
        v = v.substring(1);
      }

      if (v.match(/\.?\//)) {
        mutatedDirectory = true;
      }

      var replace = new RegExp(escapeRegEx(this.filename()) + '$');
      v = URI.recodePath(v);
      this._parts.path = this._parts.path.replace(replace, v);

      if (mutatedDirectory) {
        this.normalizePath(build);
      } else {
        this.build(!build);
      }

      return this;
    }
  };
  p.suffix = function(v, build) {
    if (this._parts.urn) {
      return v === undefined ? '' : this;
    }

    if (v === undefined || v === true) {
      if (!this._parts.path || this._parts.path === '/') {
        return '';
      }

      var filename = this.filename();
      var pos = filename.lastIndexOf('.');
      var s, res;

      if (pos === -1) {
        return '';
      }

      // suffix may only contain alnum characters (yup, I made this up.)
      s = filename.substring(pos+1);
      res = (/^[a-z0-9%]+$/i).test(s) ? s : '';
      return v ? URI.decodePathSegment(res) : res;
    } else {
      if (v.charAt(0) === '.') {
        v = v.substring(1);
      }

      var suffix = this.suffix();
      var replace;

      if (!suffix) {
        if (!v) {
          return this;
        }

        this._parts.path += '.' + URI.recodePath(v);
      } else if (!v) {
        replace = new RegExp(escapeRegEx('.' + suffix) + '$');
      } else {
        replace = new RegExp(escapeRegEx(suffix) + '$');
      }

      if (replace) {
        v = URI.recodePath(v);
        this._parts.path = this._parts.path.replace(replace, v);
      }

      this.build(!build);
      return this;
    }
  };
  p.segment = function(segment, v, build) {
    var separator = this._parts.urn ? ':' : '/';
    var path = this.path();
    var absolute = path.substring(0, 1) === '/';
    var segments = path.split(separator);

    if (segment !== undefined && typeof segment !== 'number') {
      build = v;
      v = segment;
      segment = undefined;
    }

    if (segment !== undefined && typeof segment !== 'number') {
      throw new Error('Bad segment "' + segment + '", must be 0-based integer');
    }

    if (absolute) {
      segments.shift();
    }

    if (segment < 0) {
      // allow negative indexes to address from the end
      segment = Math.max(segments.length + segment, 0);
    }

    if (v === undefined) {
      /*jshint laxbreak: true */
      return segment === undefined
        ? segments
        : segments[segment];
      /*jshint laxbreak: false */
    } else if (segment === null || segments[segment] === undefined) {
      if (isArray(v)) {
        segments = [];
        // collapse empty elements within array
        for (var i=0, l=v.length; i < l; i++) {
          if (!v[i].length && (!segments.length || !segments[segments.length -1].length)) {
            continue;
          }

          if (segments.length && !segments[segments.length -1].length) {
            segments.pop();
          }

          segments.push(trimSlashes(v[i]));
        }
      } else if (v || typeof v === 'string') {
        v = trimSlashes(v);
        if (segments[segments.length -1] === '') {
          // empty trailing elements have to be overwritten
          // to prevent results such as /foo//bar
          segments[segments.length -1] = v;
        } else {
          segments.push(v);
        }
      }
    } else {
      if (v) {
        segments[segment] = trimSlashes(v);
      } else {
        segments.splice(segment, 1);
      }
    }

    if (absolute) {
      segments.unshift('');
    }

    return this.path(segments.join(separator), build);
  };
  p.segmentCoded = function(segment, v, build) {
    var segments, i, l;

    if (typeof segment !== 'number') {
      build = v;
      v = segment;
      segment = undefined;
    }

    if (v === undefined) {
      segments = this.segment(segment, v, build);
      if (!isArray(segments)) {
        segments = segments !== undefined ? URI.decode(segments) : undefined;
      } else {
        for (i = 0, l = segments.length; i < l; i++) {
          segments[i] = URI.decode(segments[i]);
        }
      }

      return segments;
    }

    if (!isArray(v)) {
      v = (typeof v === 'string' || v instanceof String) ? URI.encode(v) : v;
    } else {
      for (i = 0, l = v.length; i < l; i++) {
        v[i] = URI.encode(v[i]);
      }
    }

    return this.segment(segment, v, build);
  };

  // mutating query string
  var q = p.query;
  p.query = function(v, build) {
    if (v === true) {
      return URI.parseQuery(this._parts.query, this._parts.escapeQuerySpace);
    } else if (typeof v === 'function') {
      var data = URI.parseQuery(this._parts.query, this._parts.escapeQuerySpace);
      var result = v.call(this, data);
      this._parts.query = URI.buildQuery(result || data, this._parts.duplicateQueryParameters, this._parts.escapeQuerySpace);
      this.build(!build);
      return this;
    } else if (v !== undefined && typeof v !== 'string') {
      this._parts.query = URI.buildQuery(v, this._parts.duplicateQueryParameters, this._parts.escapeQuerySpace);
      this.build(!build);
      return this;
    } else {
      return q.call(this, v, build);
    }
  };
  p.setQuery = function(name, value, build) {
    var data = URI.parseQuery(this._parts.query, this._parts.escapeQuerySpace);

    if (typeof name === 'string' || name instanceof String) {
      data[name] = value !== undefined ? value : null;
    } else if (typeof name === 'object') {
      for (var key in name) {
        if (hasOwn.call(name, key)) {
          data[key] = name[key];
        }
      }
    } else {
      throw new TypeError('URI.addQuery() accepts an object, string as the name parameter');
    }

    this._parts.query = URI.buildQuery(data, this._parts.duplicateQueryParameters, this._parts.escapeQuerySpace);
    if (typeof name !== 'string') {
      build = value;
    }

    this.build(!build);
    return this;
  };
  p.addQuery = function(name, value, build) {
    var data = URI.parseQuery(this._parts.query, this._parts.escapeQuerySpace);
    URI.addQuery(data, name, value === undefined ? null : value);
    this._parts.query = URI.buildQuery(data, this._parts.duplicateQueryParameters, this._parts.escapeQuerySpace);
    if (typeof name !== 'string') {
      build = value;
    }

    this.build(!build);
    return this;
  };
  p.removeQuery = function(name, value, build) {
    var data = URI.parseQuery(this._parts.query, this._parts.escapeQuerySpace);
    URI.removeQuery(data, name, value);
    this._parts.query = URI.buildQuery(data, this._parts.duplicateQueryParameters, this._parts.escapeQuerySpace);
    if (typeof name !== 'string') {
      build = value;
    }

    this.build(!build);
    return this;
  };
  p.hasQuery = function(name, value, withinArray) {
    var data = URI.parseQuery(this._parts.query, this._parts.escapeQuerySpace);
    return URI.hasQuery(data, name, value, withinArray);
  };
  p.setSearch = p.setQuery;
  p.addSearch = p.addQuery;
  p.removeSearch = p.removeQuery;
  p.hasSearch = p.hasQuery;

  // sanitizing URLs
  p.normalize = function() {
    if (this._parts.urn) {
      return this
        .normalizeProtocol(false)
        .normalizePath(false)
        .normalizeQuery(false)
        .normalizeFragment(false)
        .build();
    }

    return this
      .normalizeProtocol(false)
      .normalizeHostname(false)
      .normalizePort(false)
      .normalizePath(false)
      .normalizeQuery(false)
      .normalizeFragment(false)
      .build();
  };
  p.normalizeProtocol = function(build) {
    if (typeof this._parts.protocol === 'string') {
      this._parts.protocol = this._parts.protocol.toLowerCase();
      this.build(!build);
    }

    return this;
  };
  p.normalizeHostname = function(build) {
    if (this._parts.hostname) {
      if (this.is('IDN') && punycode) {
        this._parts.hostname = punycode.toASCII(this._parts.hostname);
      } else if (this.is('IPv6') && IPv6) {
        this._parts.hostname = IPv6.best(this._parts.hostname);
      }

      this._parts.hostname = this._parts.hostname.toLowerCase();
      this.build(!build);
    }

    return this;
  };
  p.normalizePort = function(build) {
    // remove port of it's the protocol's default
    if (typeof this._parts.protocol === 'string' && this._parts.port === URI.defaultPorts[this._parts.protocol]) {
      this._parts.port = null;
      this.build(!build);
    }

    return this;
  };
  p.normalizePath = function(build) {
    var _path = this._parts.path;
    if (!_path) {
      return this;
    }

    if (this._parts.urn) {
      this._parts.path = URI.recodeUrnPath(this._parts.path);
      this.build(!build);
      return this;
    }

    if (this._parts.path === '/') {
      return this;
    }

    _path = URI.recodePath(_path);

    var _was_relative;
    var _leadingParents = '';
    var _parent, _pos;

    // handle relative paths
    if (_path.charAt(0) !== '/') {
      _was_relative = true;
      _path = '/' + _path;
    }

    // handle relative files (as opposed to directories)
    if (_path.slice(-3) === '/..' || _path.slice(-2) === '/.') {
      _path += '/';
    }

    // resolve simples
    _path = _path
      .replace(/(\/(\.\/)+)|(\/\.$)/g, '/')
      .replace(/\/{2,}/g, '/');

    // remember leading parents
    if (_was_relative) {
      _leadingParents = _path.substring(1).match(/^(\.\.\/)+/) || '';
      if (_leadingParents) {
        _leadingParents = _leadingParents[0];
      }
    }

    // resolve parents
    while (true) {
      _parent = _path.search(/\/\.\.(\/|$)/);
      if (_parent === -1) {
        // no more ../ to resolve
        break;
      } else if (_parent === 0) {
        // top level cannot be relative, skip it
        _path = _path.substring(3);
        continue;
      }

      _pos = _path.substring(0, _parent).lastIndexOf('/');
      if (_pos === -1) {
        _pos = _parent;
      }
      _path = _path.substring(0, _pos) + _path.substring(_parent + 3);
    }

    // revert to relative
    if (_was_relative && this.is('relative')) {
      _path = _leadingParents + _path.substring(1);
    }

    this._parts.path = _path;
    this.build(!build);
    return this;
  };
  p.normalizePathname = p.normalizePath;
  p.normalizeQuery = function(build) {
    if (typeof this._parts.query === 'string') {
      if (!this._parts.query.length) {
        this._parts.query = null;
      } else {
        this.query(URI.parseQuery(this._parts.query, this._parts.escapeQuerySpace));
      }

      this.build(!build);
    }

    return this;
  };
  p.normalizeFragment = function(build) {
    if (!this._parts.fragment) {
      this._parts.fragment = null;
      this.build(!build);
    }

    return this;
  };
  p.normalizeSearch = p.normalizeQuery;
  p.normalizeHash = p.normalizeFragment;

  p.iso8859 = function() {
    // expect unicode input, iso8859 output
    var e = URI.encode;
    var d = URI.decode;

    URI.encode = escape;
    URI.decode = decodeURIComponent;
    try {
      this.normalize();
    } finally {
      URI.encode = e;
      URI.decode = d;
    }
    return this;
  };

  p.unicode = function() {
    // expect iso8859 input, unicode output
    var e = URI.encode;
    var d = URI.decode;

    URI.encode = strictEncodeURIComponent;
    URI.decode = unescape;
    try {
      this.normalize();
    } finally {
      URI.encode = e;
      URI.decode = d;
    }
    return this;
  };

  p.readable = function() {
    var uri = this.clone();
    // removing username, password, because they shouldn't be displayed according to RFC 3986
    uri.username('').password('').normalize();
    var t = '';
    if (uri._parts.protocol) {
      t += uri._parts.protocol + '://';
    }

    if (uri._parts.hostname) {
      if (uri.is('punycode') && punycode) {
        t += punycode.toUnicode(uri._parts.hostname);
        if (uri._parts.port) {
          t += ':' + uri._parts.port;
        }
      } else {
        t += uri.host();
      }
    }

    if (uri._parts.hostname && uri._parts.path && uri._parts.path.charAt(0) !== '/') {
      t += '/';
    }

    t += uri.path(true);
    if (uri._parts.query) {
      var q = '';
      for (var i = 0, qp = uri._parts.query.split('&'), l = qp.length; i < l; i++) {
        var kv = (qp[i] || '').split('=');
        q += '&' + URI.decodeQuery(kv[0], this._parts.escapeQuerySpace)
          .replace(/&/g, '%26');

        if (kv[1] !== undefined) {
          q += '=' + URI.decodeQuery(kv[1], this._parts.escapeQuerySpace)
            .replace(/&/g, '%26');
        }
      }
      t += '?' + q.substring(1);
    }

    t += URI.decodeQuery(uri.hash(), true);
    return t;
  };

  // resolving relative and absolute URLs
  p.absoluteTo = function(base) {
    var resolved = this.clone();
    var properties = ['protocol', 'username', 'password', 'hostname', 'port'];
    var basedir, i, p;

    if (this._parts.urn) {
      throw new Error('URNs do not have any generally defined hierarchical components');
    }

    if (!(base instanceof URI)) {
      base = new URI(base);
    }

    if (resolved._parts.protocol) {
      // Directly returns even if this._parts.hostname is empty.
      return resolved;
    } else {
      resolved._parts.protocol = base._parts.protocol;
    }

    if (this._parts.hostname) {
      return resolved;
    }

    for (i = 0; (p = properties[i]); i++) {
      resolved._parts[p] = base._parts[p];
    }

    if (!resolved._parts.path) {
      resolved._parts.path = base._parts.path;
      if (!resolved._parts.query) {
        resolved._parts.query = base._parts.query;
      }
    } else {
      if (resolved._parts.path.substring(-2) === '..') {
        resolved._parts.path += '/';
      }

      if (resolved.path().charAt(0) !== '/') {
        basedir = base.directory();
        basedir = basedir ? basedir : base.path().indexOf('/') === 0 ? '/' : '';
        resolved._parts.path = (basedir ? (basedir + '/') : '') + resolved._parts.path;
        resolved.normalizePath();
      }
    }

    resolved.build();
    return resolved;
  };
  p.relativeTo = function(base) {
    var relative = this.clone().normalize();
    var relativeParts, baseParts, common, relativePath, basePath;

    if (relative._parts.urn) {
      throw new Error('URNs do not have any generally defined hierarchical components');
    }

    base = new URI(base).normalize();
    relativeParts = relative._parts;
    baseParts = base._parts;
    relativePath = relative.path();
    basePath = base.path();

    if (relativePath.charAt(0) !== '/') {
      throw new Error('URI is already relative');
    }

    if (basePath.charAt(0) !== '/') {
      throw new Error('Cannot calculate a URI relative to another relative URI');
    }

    if (relativeParts.protocol === baseParts.protocol) {
      relativeParts.protocol = null;
    }

    if (relativeParts.username !== baseParts.username || relativeParts.password !== baseParts.password) {
      return relative.build();
    }

    if (relativeParts.protocol !== null || relativeParts.username !== null || relativeParts.password !== null) {
      return relative.build();
    }

    if (relativeParts.hostname === baseParts.hostname && relativeParts.port === baseParts.port) {
      relativeParts.hostname = null;
      relativeParts.port = null;
    } else {
      return relative.build();
    }

    if (relativePath === basePath) {
      relativeParts.path = '';
      return relative.build();
    }

    // determine common sub path
    common = URI.commonPath(relativePath, basePath);

    // If the paths have nothing in common, return a relative URL with the absolute path.
    if (!common) {
      return relative.build();
    }

    var parents = baseParts.path
      .substring(common.length)
      .replace(/[^\/]*$/, '')
      .replace(/.*?\//g, '../');

    relativeParts.path = (parents + relativeParts.path.substring(common.length)) || './';

    return relative.build();
  };

  // comparing URIs
  p.equals = function(uri) {
    var one = this.clone();
    var two = new URI(uri);
    var one_map = {};
    var two_map = {};
    var checked = {};
    var one_query, two_query, key;

    one.normalize();
    two.normalize();

    // exact match
    if (one.toString() === two.toString()) {
      return true;
    }

    // extract query string
    one_query = one.query();
    two_query = two.query();
    one.query('');
    two.query('');

    // definitely not equal if not even non-query parts match
    if (one.toString() !== two.toString()) {
      return false;
    }

    // query parameters have the same length, even if they're permuted
    if (one_query.length !== two_query.length) {
      return false;
    }

    one_map = URI.parseQuery(one_query, this._parts.escapeQuerySpace);
    two_map = URI.parseQuery(two_query, this._parts.escapeQuerySpace);

    for (key in one_map) {
      if (hasOwn.call(one_map, key)) {
        if (!isArray(one_map[key])) {
          if (one_map[key] !== two_map[key]) {
            return false;
          }
        } else if (!arraysEqual(one_map[key], two_map[key])) {
          return false;
        }

        checked[key] = true;
      }
    }

    for (key in two_map) {
      if (hasOwn.call(two_map, key)) {
        if (!checked[key]) {
          // two contains a parameter not present in one
          return false;
        }
      }
    }

    return true;
  };

  // state
  p.preventInvalidHostname = function(v) {
    this._parts.preventInvalidHostname = !!v;
    return this;
  };

  p.duplicateQueryParameters = function(v) {
    this._parts.duplicateQueryParameters = !!v;
    return this;
  };

  p.escapeQuerySpace = function(v) {
    this._parts.escapeQuerySpace = !!v;
    return this;
  };

  return URI;
}));

/*!
 * jQuery blockUI plugin
 * Version 2.70.0-2014.11.23
 * Requires jQuery v1.7 or later
 *
 * Examples at: http://malsup.com/jquery/block/
 * Copyright (c) 2007-2013 M. Alsup
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 *
 * Thanks to Amir-Hossein Sobhi for some excellent contributions!
 */

;(function() {
/*jshint eqeqeq:false curly:false latedef:false */
"use strict";

	function setup($) {
		$.fn._fadeIn = $.fn.fadeIn;

		var noOp = $.noop || function() {};

		// this bit is to ensure we don't call setExpression when we shouldn't (with extra muscle to handle
		// confusing userAgent strings on Vista)
		var msie = /MSIE/.test(navigator.userAgent);
		var ie6  = /MSIE 6.0/.test(navigator.userAgent) && ! /MSIE 8.0/.test(navigator.userAgent);
		var mode = document.documentMode || 0;
		var setExpr = $.isFunction( document.createElement('div').style.setExpression );

		// global $ methods for blocking/unblocking the entire page
		$.blockUI   = function(opts) { install(window, opts); };
		$.unblockUI = function(opts) { remove(window, opts); };

		// convenience method for quick growl-like notifications  (http://www.google.com/search?q=growl)
		$.growlUI = function(title, message, timeout, onClose) {
			var $m = $('<div class="growlUI"></div>');
			if (title) $m.append('<h1>'+title+'</h1>');
			if (message) $m.append('<h2>'+message+'</h2>');
			if (timeout === undefined) timeout = 3000;

			// Added by konapun: Set timeout to 30 seconds if this growl is moused over, like normal toast notifications
			var callBlock = function(opts) {
				opts = opts || {};

				$.blockUI({
					message: $m,
					fadeIn : typeof opts.fadeIn  !== 'undefined' ? opts.fadeIn  : 700,
					fadeOut: typeof opts.fadeOut !== 'undefined' ? opts.fadeOut : 1000,
					timeout: typeof opts.timeout !== 'undefined' ? opts.timeout : timeout,
					centerY: false,
					showOverlay: false,
					onUnblock: onClose,
					css: $.blockUI.defaults.growlCSS
				});
			};

			callBlock();
			var nonmousedOpacity = $m.css('opacity');
			$m.mouseover(function() {
				callBlock({
					fadeIn: 0,
					timeout: 30000
				});

				var displayBlock = $('.blockMsg');
				displayBlock.stop(); // cancel fadeout if it has started
				displayBlock.fadeTo(300, 1); // make it easier to read the message by removing transparency
			}).mouseout(function() {
				$('.blockMsg').fadeOut(1000);
			});
			// End konapun additions
		};

		// plugin method for blocking element content
		$.fn.block = function(opts) {
			if ( this[0] === window ) {
				$.blockUI( opts );
				return this;
			}
			var fullOpts = $.extend({}, $.blockUI.defaults, opts || {});
			this.each(function() {
				var $el = $(this);
				if (fullOpts.ignoreIfBlocked && $el.data('blockUI.isBlocked'))
					return;
				$el.unblock({ fadeOut: 0 });
			});

			return this.each(function() {
				if ($.css(this,'position') == 'static') {
					this.style.position = 'relative';
					$(this).data('blockUI.static', true);
				}
				this.style.zoom = 1; // force 'hasLayout' in ie
				install(this, opts);
			});
		};

		// plugin method for unblocking element content
		$.fn.unblock = function(opts) {
			if ( this[0] === window ) {
				$.unblockUI( opts );
				return this;
			}
			return this.each(function() {
				remove(this, opts);
			});
		};

		$.blockUI.version = 2.70; // 2nd generation blocking at no extra cost!

		// override these in your code to change the default behavior and style
		$.blockUI.defaults = {
			// message displayed when blocking (use null for no message)
			message:  '<h1>Please wait...</h1>',

			title: null,		// title string; only used when theme == true
			draggable: true,	// only used when theme == true (requires jquery-ui.js to be loaded)

			theme: false, // set to true to use with jQuery UI themes

			// styles for the message when blocking; if you wish to disable
			// these and use an external stylesheet then do this in your code:
			// $.blockUI.defaults.css = {};
			css: {
				padding:	0,
				margin:		0,
				width:		'30%',
				top:		'40%',
				left:		'35%',
				textAlign:	'center',
				color:		'#000',
				border:		'3px solid #aaa',
				backgroundColor:'#fff',
				cursor:		'wait'
			},

			// minimal style set used when themes are used
			themedCSS: {
				width:	'30%',
				top:	'40%',
				left:	'35%'
			},

			// styles for the overlay
			overlayCSS:  {
				backgroundColor:	'#000',
				opacity:			0.6,
				cursor:				'wait'
			},

			// style to replace wait cursor before unblocking to correct issue
			// of lingering wait cursor
			cursorReset: 'default',

			// styles applied when using $.growlUI
			growlCSS: {
				width:		'350px',
				top:		'10px',
				left:		'',
				right:		'10px',
				border:		'none',
				padding:	'5px',
				opacity:	0.6,
				cursor:		'default',
				color:		'#fff',
				backgroundColor: '#000',
				'-webkit-border-radius':'10px',
				'-moz-border-radius':	'10px',
				'border-radius':		'10px'
			},

			// IE issues: 'about:blank' fails on HTTPS and javascript:false is s-l-o-w
			// (hat tip to Jorge H. N. de Vasconcelos)
			/*jshint scripturl:true */
			iframeSrc: /^https/i.test(window.location.href || '') ? 'javascript:false' : 'about:blank',

			// force usage of iframe in non-IE browsers (handy for blocking applets)
			forceIframe: false,

			// z-index for the blocking overlay
			baseZ: 1000,

			// set these to true to have the message automatically centered
			centerX: true, // <-- only effects element blocking (page block controlled via css above)
			centerY: true,

			// allow body element to be stetched in ie6; this makes blocking look better
			// on "short" pages.  disable if you wish to prevent changes to the body height
			allowBodyStretch: true,

			// enable if you want key and mouse events to be disabled for content that is blocked
			bindEvents: true,

			// be default blockUI will supress tab navigation from leaving blocking content
			// (if bindEvents is true)
			constrainTabKey: true,

			// fadeIn time in millis; set to 0 to disable fadeIn on block
			fadeIn:  200,

			// fadeOut time in millis; set to 0 to disable fadeOut on unblock
			fadeOut:  400,

			// time in millis to wait before auto-unblocking; set to 0 to disable auto-unblock
			timeout: 0,

			// disable if you don't want to show the overlay
			showOverlay: true,

			// if true, focus will be placed in the first available input field when
			// page blocking
			focusInput: true,

            // elements that can receive focus
            focusableElements: ':input:enabled:visible',

			// suppresses the use of overlay styles on FF/Linux (due to performance issues with opacity)
			// no longer needed in 2012
			// applyPlatformOpacityRules: true,

			// callback method invoked when fadeIn has completed and blocking message is visible
			onBlock: null,

			// callback method invoked when unblocking has completed; the callback is
			// passed the element that has been unblocked (which is the window object for page
			// blocks) and the options that were passed to the unblock call:
			//	onUnblock(element, options)
			onUnblock: null,

			// callback method invoked when the overlay area is clicked.
			// setting this will turn the cursor to a pointer, otherwise cursor defined in overlayCss will be used.
			onOverlayClick: null,

			// don't ask; if you really must know: http://groups.google.com/group/jquery-en/browse_thread/thread/36640a8730503595/2f6a79a77a78e493#2f6a79a77a78e493
			quirksmodeOffsetHack: 4,

			// class name of the message block
			blockMsgClass: 'blockMsg',

			// if it is already blocked, then ignore it (don't unblock and reblock)
			ignoreIfBlocked: false
		};

		// private data and functions follow...

		var pageBlock = null;
		var pageBlockEls = [];

		function install(el, opts) {
			var css, themedCSS;
			var full = (el == window);
			var msg = (opts && opts.message !== undefined ? opts.message : undefined);
			opts = $.extend({}, $.blockUI.defaults, opts || {});

			if (opts.ignoreIfBlocked && $(el).data('blockUI.isBlocked'))
				return;

			opts.overlayCSS = $.extend({}, $.blockUI.defaults.overlayCSS, opts.overlayCSS || {});
			css = $.extend({}, $.blockUI.defaults.css, opts.css || {});
			if (opts.onOverlayClick)
				opts.overlayCSS.cursor = 'pointer';

			themedCSS = $.extend({}, $.blockUI.defaults.themedCSS, opts.themedCSS || {});
			msg = msg === undefined ? opts.message : msg;

			// remove the current block (if there is one)
			if (full && pageBlock)
				remove(window, {fadeOut:0});

			// if an existing element is being used as the blocking content then we capture
			// its current place in the DOM (and current display style) so we can restore
			// it when we unblock
			if (msg && typeof msg != 'string' && (msg.parentNode || msg.jquery)) {
				var node = msg.jquery ? msg[0] : msg;
				var data = {};
				$(el).data('blockUI.history', data);
				data.el = node;
				data.parent = node.parentNode;
				data.display = node.style.display;
				data.position = node.style.position;
				if (data.parent)
					data.parent.removeChild(node);
			}

			$(el).data('blockUI.onUnblock', opts.onUnblock);
			var z = opts.baseZ;

			// blockUI uses 3 layers for blocking, for simplicity they are all used on every platform;
			// layer1 is the iframe layer which is used to supress bleed through of underlying content
			// layer2 is the overlay layer which has opacity and a wait cursor (by default)
			// layer3 is the message content that is displayed while blocking
			var lyr1, lyr2, lyr3, s;
			if (msie || opts.forceIframe)
				lyr1 = $('<iframe class="blockUI" style="z-index:'+ (z++) +';display:none;border:none;margin:0;padding:0;position:absolute;width:100%;height:100%;top:0;left:0" src="'+opts.iframeSrc+'"></iframe>');
			else
				lyr1 = $('<div class="blockUI" style="display:none"></div>');

			if (opts.theme)
				lyr2 = $('<div class="blockUI blockOverlay ui-widget-overlay" style="z-index:'+ (z++) +';display:none"></div>');
			else
				lyr2 = $('<div class="blockUI blockOverlay" style="z-index:'+ (z++) +';display:none;border:none;margin:0;padding:0;width:100%;height:100%;top:0;left:0"></div>');

			if (opts.theme && full) {
				s = '<div class="blockUI ' + opts.blockMsgClass + ' blockPage ui-dialog ui-widget ui-corner-all" style="z-index:'+(z+10)+';display:none;position:fixed">';
				if ( opts.title ) {
					s += '<div class="ui-widget-header ui-dialog-titlebar ui-corner-all blockTitle">'+(opts.title || '&nbsp;')+'</div>';
				}
				s += '<div class="ui-widget-content ui-dialog-content"></div>';
				s += '</div>';
			}
			else if (opts.theme) {
				s = '<div class="blockUI ' + opts.blockMsgClass + ' blockElement ui-dialog ui-widget ui-corner-all" style="z-index:'+(z+10)+';display:none;position:absolute">';
				if ( opts.title ) {
					s += '<div class="ui-widget-header ui-dialog-titlebar ui-corner-all blockTitle">'+(opts.title || '&nbsp;')+'</div>';
				}
				s += '<div class="ui-widget-content ui-dialog-content"></div>';
				s += '</div>';
			}
			else if (full) {
				s = '<div class="blockUI ' + opts.blockMsgClass + ' blockPage" style="z-index:'+(z+10)+';display:none;position:fixed"></div>';
			}
			else {
				s = '<div class="blockUI ' + opts.blockMsgClass + ' blockElement" style="z-index:'+(z+10)+';display:none;position:absolute"></div>';
			}
			lyr3 = $(s);

			// if we have a message, style it
			if (msg) {
				if (opts.theme) {
					lyr3.css(themedCSS);
					lyr3.addClass('ui-widget-content');
				}
				else
					lyr3.css(css);
			}

			// style the overlay
			if (!opts.theme /*&& (!opts.applyPlatformOpacityRules)*/)
				lyr2.css(opts.overlayCSS);
			lyr2.css('position', full ? 'fixed' : 'absolute');

			// make iframe layer transparent in IE
			if (msie || opts.forceIframe)
				lyr1.css('opacity',0.0);

			//$([lyr1[0],lyr2[0],lyr3[0]]).appendTo(full ? 'body' : el);
			var layers = [lyr1,lyr2,lyr3], $par = full ? $('body') : $(el);
			$.each(layers, function() {
				this.appendTo($par);
			});

			if (opts.theme && opts.draggable && $.fn.draggable) {
				lyr3.draggable({
					handle: '.ui-dialog-titlebar',
					cancel: 'li'
				});
			}

			// ie7 must use absolute positioning in quirks mode and to account for activex issues (when scrolling)
			var expr = setExpr && (!$.support.boxModel || $('object,embed', full ? null : el).length > 0);
			if (ie6 || expr) {
				// give body 100% height
				if (full && opts.allowBodyStretch && $.support.boxModel)
					$('html,body').css('height','100%');

				// fix ie6 issue when blocked element has a border width
				if ((ie6 || !$.support.boxModel) && !full) {
					var t = sz(el,'borderTopWidth'), l = sz(el,'borderLeftWidth');
					var fixT = t ? '(0 - '+t+')' : 0;
					var fixL = l ? '(0 - '+l+')' : 0;
				}

				// simulate fixed position
				$.each(layers, function(i,o) {
					var s = o[0].style;
					s.position = 'absolute';
					if (i < 2) {
						if (full)
							s.setExpression('height','Math.max(document.body.scrollHeight, document.body.offsetHeight) - (jQuery.support.boxModel?0:'+opts.quirksmodeOffsetHack+') + "px"');
						else
							s.setExpression('height','this.parentNode.offsetHeight + "px"');
						if (full)
							s.setExpression('width','jQuery.support.boxModel && document.documentElement.clientWidth || document.body.clientWidth + "px"');
						else
							s.setExpression('width','this.parentNode.offsetWidth + "px"');
						if (fixL) s.setExpression('left', fixL);
						if (fixT) s.setExpression('top', fixT);
					}
					else if (opts.centerY) {
						if (full) s.setExpression('top','(document.documentElement.clientHeight || document.body.clientHeight) / 2 - (this.offsetHeight / 2) + (blah = document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop) + "px"');
						s.marginTop = 0;
					}
					else if (!opts.centerY && full) {
						var top = (opts.css && opts.css.top) ? parseInt(opts.css.top, 10) : 0;
						var expression = '((document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop) + '+top+') + "px"';
						s.setExpression('top',expression);
					}
				});
			}

			// show the message
			if (msg) {
				if (opts.theme)
					lyr3.find('.ui-widget-content').append(msg);
				else
					lyr3.append(msg);
				if (msg.jquery || msg.nodeType)
					$(msg).show();
			}

			if ((msie || opts.forceIframe) && opts.showOverlay)
				lyr1.show(); // opacity is zero
			if (opts.fadeIn) {
				var cb = opts.onBlock ? opts.onBlock : noOp;
				var cb1 = (opts.showOverlay && !msg) ? cb : noOp;
				var cb2 = msg ? cb : noOp;
				if (opts.showOverlay)
					lyr2._fadeIn(opts.fadeIn, cb1);
				if (msg)
					lyr3._fadeIn(opts.fadeIn, cb2);
			}
			else {
				if (opts.showOverlay)
					lyr2.show();
				if (msg)
					lyr3.show();
				if (opts.onBlock)
					opts.onBlock.bind(lyr3)();
			}

			// bind key and mouse events
			bind(1, el, opts);

			if (full) {
				pageBlock = lyr3[0];
				pageBlockEls = $(opts.focusableElements,pageBlock);
				if (opts.focusInput)
					setTimeout(focus, 20);
			}
			else
				center(lyr3[0], opts.centerX, opts.centerY);

			if (opts.timeout) {
				// auto-unblock
				var to = setTimeout(function() {
					if (full)
						$.unblockUI(opts);
					else
						$(el).unblock(opts);
				}, opts.timeout);
				$(el).data('blockUI.timeout', to);
			}
		}

		// remove the block
		function remove(el, opts) {
			var count;
			var full = (el == window);
			var $el = $(el);
			var data = $el.data('blockUI.history');
			var to = $el.data('blockUI.timeout');
			if (to) {
				clearTimeout(to);
				$el.removeData('blockUI.timeout');
			}
			opts = $.extend({}, $.blockUI.defaults, opts || {});
			bind(0, el, opts); // unbind events

			if (opts.onUnblock === null) {
				opts.onUnblock = $el.data('blockUI.onUnblock');
				$el.removeData('blockUI.onUnblock');
			}

			var els;
			if (full) // crazy selector to handle odd field errors in ie6/7
				els = $('body').children().filter('.blockUI').add('body > .blockUI');
			else
				els = $el.find('>.blockUI');

			// fix cursor issue
			if ( opts.cursorReset ) {
				if ( els.length > 1 )
					els[1].style.cursor = opts.cursorReset;
				if ( els.length > 2 )
					els[2].style.cursor = opts.cursorReset;
			}

			if (full)
				pageBlock = pageBlockEls = null;

			if (opts.fadeOut) {
				count = els.length;
				els.stop().fadeOut(opts.fadeOut, function() {
					if ( --count === 0)
						reset(els,data,opts,el);
				});
			}
			else
				reset(els, data, opts, el);
		}

		// move blocking element back into the DOM where it started
		function reset(els,data,opts,el) {
			var $el = $(el);
			if ( $el.data('blockUI.isBlocked') )
				return;

			els.each(function(i,o) {
				// remove via DOM calls so we don't lose event handlers
				if (this.parentNode)
					this.parentNode.removeChild(this);
			});

			if (data && data.el) {
				data.el.style.display = data.display;
				data.el.style.position = data.position;
				data.el.style.cursor = 'default'; // #59
				if (data.parent)
					data.parent.appendChild(data.el);
				$el.removeData('blockUI.history');
			}

			if ($el.data('blockUI.static')) {
				$el.css('position', 'static'); // #22
			}

			if (typeof opts.onUnblock == 'function')
				opts.onUnblock(el,opts);

			// fix issue in Safari 6 where block artifacts remain until reflow
			var body = $(document.body), w = body.width(), cssW = body[0].style.width;
			body.width(w-1).width(w);
			body[0].style.width = cssW;
		}

		// bind/unbind the handler
		function bind(b, el, opts) {
			var full = el == window, $el = $(el);

			// don't bother unbinding if there is nothing to unbind
			if (!b && (full && !pageBlock || !full && !$el.data('blockUI.isBlocked')))
				return;

			$el.data('blockUI.isBlocked', b);

			// don't bind events when overlay is not in use or if bindEvents is false
			if (!full || !opts.bindEvents || (b && !opts.showOverlay))
				return;

			// bind anchors and inputs for mouse and key events
			var events = 'mousedown mouseup keydown keypress keyup touchstart touchend touchmove';
			if (b)
				$(document).bind(events, opts, handler);
			else
				$(document).unbind(events, handler);

		// former impl...
		//		var $e = $('a,:input');
		//		b ? $e.bind(events, opts, handler) : $e.unbind(events, handler);
		}

		// event handler to suppress keyboard/mouse events when blocking
		function handler(e) {
			// allow tab navigation (conditionally)
			if (e.type === 'keydown' && e.keyCode && e.keyCode == 9) {
				if (pageBlock && e.data.constrainTabKey) {
					var els = pageBlockEls;
					var fwd = !e.shiftKey && e.target === els[els.length-1];
					var back = e.shiftKey && e.target === els[0];
					if (fwd || back) {
						setTimeout(function(){focus(back);},10);
						return false;
					}
				}
			}
			var opts = e.data;
			var target = $(e.target);
			if (target.hasClass('blockOverlay') && opts.onOverlayClick)
				opts.onOverlayClick(e);

			// allow events within the message content
			if (target.parents('div.' + opts.blockMsgClass).length > 0)
				return true;

			// allow events for content that is not being blocked
			return target.parents().children().filter('div.blockUI').length === 0;
		}

		function focus(back) {
			if (!pageBlockEls)
				return;
			var e = pageBlockEls[back===true ? pageBlockEls.length-1 : 0];
			if (e)
				e.focus();
		}

		function center(el, x, y) {
			var p = el.parentNode, s = el.style;
			var l = ((p.offsetWidth - el.offsetWidth)/2) - sz(p,'borderLeftWidth');
			var t = ((p.offsetHeight - el.offsetHeight)/2) - sz(p,'borderTopWidth');
			if (x) s.left = l > 0 ? (l+'px') : '0';
			if (y) s.top  = t > 0 ? (t+'px') : '0';
		}

		function sz(el, p) {
			return parseInt($.css(el,p),10)||0;
		}

	}


	/*global define:true */
	if (typeof define === 'function' && define.amd && define.amd.jQuery) {
		define(['jquery'], setup);
	} else {
		setup(jQuery);
	}

})();

/*!
 * jQuery Form Plugin
 * version: 4.2.2
 * Requires jQuery v1.7.2 or later
 * Project repository: https://github.com/jquery-form/form

 * Copyright 2017 Kevin Morris
 * Copyright 2006 M. Alsup

 * Dual licensed under the LGPL-2.1+ or MIT licenses
 * https://github.com/jquery-form/form#license

 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 */
!function(e){"function"==typeof define&&define.amd?define(["jquery"],e):"object"==typeof module&&module.exports?module.exports=function(t,r){return void 0===r&&(r="undefined"!=typeof window?require("jquery"):require("jquery")(t)),e(r),r}:e(jQuery)}(function(e){"use strict";function t(t){var r=t.data;t.isDefaultPrevented()||(t.preventDefault(),e(t.target).closest("form").ajaxSubmit(r))}function r(t){var r=t.target,a=e(r);if(!a.is("[type=submit],[type=image]")){var n=a.closest("[type=submit]");if(0===n.length)return;r=n[0]}var i=r.form;if(i.clk=r,"image"===r.type)if(void 0!==t.offsetX)i.clk_x=t.offsetX,i.clk_y=t.offsetY;else if("function"==typeof e.fn.offset){var o=a.offset();i.clk_x=t.pageX-o.left,i.clk_y=t.pageY-o.top}else i.clk_x=t.pageX-r.offsetLeft,i.clk_y=t.pageY-r.offsetTop;setTimeout(function(){i.clk=i.clk_x=i.clk_y=null},100)}function a(){if(e.fn.ajaxSubmit.debug){var t="[jquery.form] "+Array.prototype.join.call(arguments,"");window.console&&window.console.log?window.console.log(t):window.opera&&window.opera.postError&&window.opera.postError(t)}}var n=/\r?\n/g,i={};i.fileapi=void 0!==e('<input type="file">').get(0).files,i.formdata=void 0!==window.FormData;var o=!!e.fn.prop;e.fn.attr2=function(){if(!o)return this.attr.apply(this,arguments);var e=this.prop.apply(this,arguments);return e&&e.jquery||"string"==typeof e?e:this.attr.apply(this,arguments)},e.fn.ajaxSubmit=function(t,r,n,s){function u(r){var a,n,i=e.param(r,t.traditional).split("&"),o=i.length,s=[];for(a=0;a<o;a++)i[a]=i[a].replace(/\+/g," "),n=i[a].split("="),s.push([decodeURIComponent(n[0]),decodeURIComponent(n[1])]);return s}function c(r){function n(e){var t=null;try{e.contentWindow&&(t=e.contentWindow.document)}catch(e){a("cannot get iframe.contentWindow document: "+e)}if(t)return t;try{t=e.contentDocument?e.contentDocument:e.document}catch(r){a("cannot get iframe.contentDocument: "+r),t=e.document}return t}function i(){function t(){try{var e=n(v).readyState;a("state = "+e),e&&"uninitialized"===e.toLowerCase()&&setTimeout(t,50)}catch(e){a("Server abort: ",e," (",e.name,")"),s(L),j&&clearTimeout(j),j=void 0}}var r=p.attr2("target"),i=p.attr2("action"),o=p.attr("enctype")||p.attr("encoding")||"multipart/form-data";w.setAttribute("target",m),l&&!/post/i.test(l)||w.setAttribute("method","POST"),i!==f.url&&w.setAttribute("action",f.url),f.skipEncodingOverride||l&&!/post/i.test(l)||p.attr({encoding:"multipart/form-data",enctype:"multipart/form-data"}),f.timeout&&(j=setTimeout(function(){T=!0,s(A)},f.timeout));var u=[];try{if(f.extraData)for(var c in f.extraData)f.extraData.hasOwnProperty(c)&&(e.isPlainObject(f.extraData[c])&&f.extraData[c].hasOwnProperty("name")&&f.extraData[c].hasOwnProperty("value")?u.push(e('<input type="hidden" name="'+f.extraData[c].name+'">',k).val(f.extraData[c].value).appendTo(w)[0]):u.push(e('<input type="hidden" name="'+c+'">',k).val(f.extraData[c]).appendTo(w)[0]));f.iframeTarget||h.appendTo(D),v.attachEvent?v.attachEvent("onload",s):v.addEventListener("load",s,!1),setTimeout(t,15);try{w.submit()}catch(e){document.createElement("form").submit.apply(w)}}finally{w.setAttribute("action",i),w.setAttribute("enctype",o),r?w.setAttribute("target",r):p.removeAttr("target"),e(u).remove()}}function s(t){if(!x.aborted&&!X){if((O=n(v))||(a("cannot access response document"),t=L),t===A&&x)return x.abort("timeout"),void S.reject(x,"timeout");if(t===L&&x)return x.abort("server abort"),void S.reject(x,"error","server abort");if(O&&O.location.href!==f.iframeSrc||T){v.detachEvent?v.detachEvent("onload",s):v.removeEventListener("load",s,!1);var r,i="success";try{if(T)throw"timeout";var o="xml"===f.dataType||O.XMLDocument||e.isXMLDoc(O);if(a("isXml="+o),!o&&window.opera&&(null===O.body||!O.body.innerHTML)&&--C)return a("requeing onLoad callback, DOM not available"),void setTimeout(s,250);var u=O.body?O.body:O.documentElement;x.responseText=u?u.innerHTML:null,x.responseXML=O.XMLDocument?O.XMLDocument:O,o&&(f.dataType="xml"),x.getResponseHeader=function(e){return{"content-type":f.dataType}[e.toLowerCase()]},u&&(x.status=Number(u.getAttribute("status"))||x.status,x.statusText=u.getAttribute("statusText")||x.statusText);var c=(f.dataType||"").toLowerCase(),l=/(json|script|text)/.test(c);if(l||f.textarea){var p=O.getElementsByTagName("textarea")[0];if(p)x.responseText=p.value,x.status=Number(p.getAttribute("status"))||x.status,x.statusText=p.getAttribute("statusText")||x.statusText;else if(l){var m=O.getElementsByTagName("pre")[0],g=O.getElementsByTagName("body")[0];m?x.responseText=m.textContent?m.textContent:m.innerText:g&&(x.responseText=g.textContent?g.textContent:g.innerText)}}else"xml"===c&&!x.responseXML&&x.responseText&&(x.responseXML=q(x.responseText));try{M=N(x,c,f)}catch(e){i="parsererror",x.error=r=e||i}}catch(e){a("error caught: ",e),i="error",x.error=r=e||i}x.aborted&&(a("upload aborted"),i=null),x.status&&(i=x.status>=200&&x.status<300||304===x.status?"success":"error"),"success"===i?(f.success&&f.success.call(f.context,M,"success",x),S.resolve(x.responseText,"success",x),d&&e.event.trigger("ajaxSuccess",[x,f])):i&&(void 0===r&&(r=x.statusText),f.error&&f.error.call(f.context,x,i,r),S.reject(x,"error",r),d&&e.event.trigger("ajaxError",[x,f,r])),d&&e.event.trigger("ajaxComplete",[x,f]),d&&!--e.active&&e.event.trigger("ajaxStop"),f.complete&&f.complete.call(f.context,x,i),X=!0,f.timeout&&clearTimeout(j),setTimeout(function(){f.iframeTarget?h.attr("src",f.iframeSrc):h.remove(),x.responseXML=null},100)}}}var u,c,f,d,m,h,v,x,y,b,T,j,w=p[0],S=e.Deferred();if(S.abort=function(e){x.abort(e)},r)for(c=0;c<g.length;c++)u=e(g[c]),o?u.prop("disabled",!1):u.removeAttr("disabled");(f=e.extend(!0,{},e.ajaxSettings,t)).context=f.context||f,m="jqFormIO"+(new Date).getTime();var k=w.ownerDocument,D=p.closest("body");if(f.iframeTarget?(b=(h=e(f.iframeTarget,k)).attr2("name"))?m=b:h.attr2("name",m):(h=e('<iframe name="'+m+'" src="'+f.iframeSrc+'" />',k)).css({position:"absolute",top:"-1000px",left:"-1000px"}),v=h[0],x={aborted:0,responseText:null,responseXML:null,status:0,statusText:"n/a",getAllResponseHeaders:function(){},getResponseHeader:function(){},setRequestHeader:function(){},abort:function(t){var r="timeout"===t?"timeout":"aborted";a("aborting upload... "+r),this.aborted=1;try{v.contentWindow.document.execCommand&&v.contentWindow.document.execCommand("Stop")}catch(e){}h.attr("src",f.iframeSrc),x.error=r,f.error&&f.error.call(f.context,x,r,t),d&&e.event.trigger("ajaxError",[x,f,r]),f.complete&&f.complete.call(f.context,x,r)}},(d=f.global)&&0==e.active++&&e.event.trigger("ajaxStart"),d&&e.event.trigger("ajaxSend",[x,f]),f.beforeSend&&!1===f.beforeSend.call(f.context,x,f))return f.global&&e.active--,S.reject(),S;if(x.aborted)return S.reject(),S;(y=w.clk)&&(b=y.name)&&!y.disabled&&(f.extraData=f.extraData||{},f.extraData[b]=y.value,"image"===y.type&&(f.extraData[b+".x"]=w.clk_x,f.extraData[b+".y"]=w.clk_y));var A=1,L=2,F=e("meta[name=csrf-token]").attr("content"),E=e("meta[name=csrf-param]").attr("content");E&&F&&(f.extraData=f.extraData||{},f.extraData[E]=F),f.forceSync?i():setTimeout(i,10);var M,O,X,C=50,q=e.parseXML||function(e,t){return window.ActiveXObject?((t=new ActiveXObject("Microsoft.XMLDOM")).async="false",t.loadXML(e)):t=(new DOMParser).parseFromString(e,"text/xml"),t&&t.documentElement&&"parsererror"!==t.documentElement.nodeName?t:null},_=e.parseJSON||function(e){return window.eval("("+e+")")},N=function(t,r,a){var n=t.getResponseHeader("content-type")||"",i=("xml"===r||!r)&&n.indexOf("xml")>=0,o=i?t.responseXML:t.responseText;return i&&"parsererror"===o.documentElement.nodeName&&e.error&&e.error("parsererror"),a&&a.dataFilter&&(o=a.dataFilter(o,r)),"string"==typeof o&&(("json"===r||!r)&&n.indexOf("json")>=0?o=_(o):("script"===r||!r)&&n.indexOf("javascript")>=0&&e.globalEval(o)),o};return S}if(!this.length)return a("ajaxSubmit: skipping submit process - no element selected"),this;var l,f,d,p=this;"function"==typeof t?t={success:t}:"string"==typeof t||!1===t&&arguments.length>0?(t={url:t,data:r,dataType:n},"function"==typeof s&&(t.success=s)):void 0===t&&(t={}),l=t.method||t.type||this.attr2("method"),(d=(d="string"==typeof(f=t.url||this.attr2("action"))?e.trim(f):"")||window.location.href||"")&&(d=(d.match(/^([^#]+)/)||[])[1]),t=e.extend(!0,{url:d,success:e.ajaxSettings.success,type:l||e.ajaxSettings.type,iframeSrc:/^https/i.test(window.location.href||"")?"javascript:false":"about:blank"},t);var m={};if(this.trigger("form-pre-serialize",[this,t,m]),m.veto)return a("ajaxSubmit: submit vetoed via form-pre-serialize trigger"),this;if(t.beforeSerialize&&!1===t.beforeSerialize(this,t))return a("ajaxSubmit: submit aborted via beforeSerialize callback"),this;var h=t.traditional;void 0===h&&(h=e.ajaxSettings.traditional);var v,g=[],x=this.formToArray(t.semantic,g,t.filtering);if(t.data){var y=e.isFunction(t.data)?t.data(x):t.data;t.extraData=y,v=e.param(y,h)}if(t.beforeSubmit&&!1===t.beforeSubmit(x,this,t))return a("ajaxSubmit: submit aborted via beforeSubmit callback"),this;if(this.trigger("form-submit-validate",[x,this,t,m]),m.veto)return a("ajaxSubmit: submit vetoed via form-submit-validate trigger"),this;var b=e.param(x,h);v&&(b=b?b+"&"+v:v),"GET"===t.type.toUpperCase()?(t.url+=(t.url.indexOf("?")>=0?"&":"?")+b,t.data=null):t.data=b;var T=[];if(t.resetForm&&T.push(function(){p.resetForm()}),t.clearForm&&T.push(function(){p.clearForm(t.includeHidden)}),!t.dataType&&t.target){var j=t.success||function(){};T.push(function(r,a,n){var i=arguments,o=t.replaceTarget?"replaceWith":"html";e(t.target)[o](r).each(function(){j.apply(this,i)})})}else t.success&&(e.isArray(t.success)?e.merge(T,t.success):T.push(t.success));if(t.success=function(e,r,a){for(var n=t.context||this,i=0,o=T.length;i<o;i++)T[i].apply(n,[e,r,a||p,p])},t.error){var w=t.error;t.error=function(e,r,a){var n=t.context||this;w.apply(n,[e,r,a,p])}}if(t.complete){var S=t.complete;t.complete=function(e,r){var a=t.context||this;S.apply(a,[e,r,p])}}var k=e("input[type=file]:enabled",this).filter(function(){return""!==e(this).val()}).length>0,D="multipart/form-data",A=p.attr("enctype")===D||p.attr("encoding")===D,L=i.fileapi&&i.formdata;a("fileAPI :"+L);var F,E=(k||A)&&!L;!1!==t.iframe&&(t.iframe||E)?t.closeKeepAlive?e.get(t.closeKeepAlive,function(){F=c(x)}):F=c(x):F=(k||A)&&L?function(r){for(var a=new FormData,n=0;n<r.length;n++)a.append(r[n].name,r[n].value);if(t.extraData){var i=u(t.extraData);for(n=0;n<i.length;n++)i[n]&&a.append(i[n][0],i[n][1])}t.data=null;var o=e.extend(!0,{},e.ajaxSettings,t,{contentType:!1,processData:!1,cache:!1,type:l||"POST"});t.uploadProgress&&(o.xhr=function(){var r=e.ajaxSettings.xhr();return r.upload&&r.upload.addEventListener("progress",function(e){var r=0,a=e.loaded||e.position,n=e.total;e.lengthComputable&&(r=Math.ceil(a/n*100)),t.uploadProgress(e,a,n,r)},!1),r}),o.data=null;var s=o.beforeSend;return o.beforeSend=function(e,r){t.formData?r.data=t.formData:r.data=a,s&&s.call(this,e,r)},e.ajax(o)}(x):e.ajax(t),p.removeData("jqxhr").data("jqxhr",F);for(var M=0;M<g.length;M++)g[M]=null;return this.trigger("form-submit-notify",[this,t]),this},e.fn.ajaxForm=function(n,i,o,s){if(("string"==typeof n||!1===n&&arguments.length>0)&&(n={url:n,data:i,dataType:o},"function"==typeof s&&(n.success=s)),n=n||{},n.delegation=n.delegation&&e.isFunction(e.fn.on),!n.delegation&&0===this.length){var u={s:this.selector,c:this.context};return!e.isReady&&u.s?(a("DOM not ready, queuing ajaxForm"),e(function(){e(u.s,u.c).ajaxForm(n)}),this):(a("terminating; zero elements found by selector"+(e.isReady?"":" (DOM not ready)")),this)}return n.delegation?(e(document).off("submit.form-plugin",this.selector,t).off("click.form-plugin",this.selector,r).on("submit.form-plugin",this.selector,n,t).on("click.form-plugin",this.selector,n,r),this):this.ajaxFormUnbind().on("submit.form-plugin",n,t).on("click.form-plugin",n,r)},e.fn.ajaxFormUnbind=function(){return this.off("submit.form-plugin click.form-plugin")},e.fn.formToArray=function(t,r,a){var n=[];if(0===this.length)return n;var o,s=this[0],u=this.attr("id"),c=t||void 0===s.elements?s.getElementsByTagName("*"):s.elements;if(c&&(c=e.makeArray(c)),u&&(t||/(Edge|Trident)\//.test(navigator.userAgent))&&(o=e(':input[form="'+u+'"]').get()).length&&(c=(c||[]).concat(o)),!c||!c.length)return n;e.isFunction(a)&&(c=e.map(c,a));var l,f,d,p,m,h,v;for(l=0,h=c.length;l<h;l++)if(m=c[l],(d=m.name)&&!m.disabled)if(t&&s.clk&&"image"===m.type)s.clk===m&&(n.push({name:d,value:e(m).val(),type:m.type}),n.push({name:d+".x",value:s.clk_x},{name:d+".y",value:s.clk_y}));else if((p=e.fieldValue(m,!0))&&p.constructor===Array)for(r&&r.push(m),f=0,v=p.length;f<v;f++)n.push({name:d,value:p[f]});else if(i.fileapi&&"file"===m.type){r&&r.push(m);var g=m.files;if(g.length)for(f=0;f<g.length;f++)n.push({name:d,value:g[f],type:m.type});else n.push({name:d,value:"",type:m.type})}else null!==p&&void 0!==p&&(r&&r.push(m),n.push({name:d,value:p,type:m.type,required:m.required}));if(!t&&s.clk){var x=e(s.clk),y=x[0];(d=y.name)&&!y.disabled&&"image"===y.type&&(n.push({name:d,value:x.val()}),n.push({name:d+".x",value:s.clk_x},{name:d+".y",value:s.clk_y}))}return n},e.fn.formSerialize=function(t){return e.param(this.formToArray(t))},e.fn.fieldSerialize=function(t){var r=[];return this.each(function(){var a=this.name;if(a){var n=e.fieldValue(this,t);if(n&&n.constructor===Array)for(var i=0,o=n.length;i<o;i++)r.push({name:a,value:n[i]});else null!==n&&void 0!==n&&r.push({name:this.name,value:n})}}),e.param(r)},e.fn.fieldValue=function(t){for(var r=[],a=0,n=this.length;a<n;a++){var i=this[a],o=e.fieldValue(i,t);null===o||void 0===o||o.constructor===Array&&!o.length||(o.constructor===Array?e.merge(r,o):r.push(o))}return r},e.fieldValue=function(t,r){var a=t.name,i=t.type,o=t.tagName.toLowerCase();if(void 0===r&&(r=!0),r&&(!a||t.disabled||"reset"===i||"button"===i||("checkbox"===i||"radio"===i)&&!t.checked||("submit"===i||"image"===i)&&t.form&&t.form.clk!==t||"select"===o&&-1===t.selectedIndex))return null;if("select"===o){var s=t.selectedIndex;if(s<0)return null;for(var u=[],c=t.options,l="select-one"===i,f=l?s+1:c.length,d=l?s:0;d<f;d++){var p=c[d];if(p.selected&&!p.disabled){var m=p.value;if(m||(m=p.attributes&&p.attributes.value&&!p.attributes.value.specified?p.text:p.value),l)return m;u.push(m)}}return u}return e(t).val().replace(n,"\r\n")},e.fn.clearForm=function(t){return this.each(function(){e("input,select,textarea",this).clearFields(t)})},e.fn.clearFields=e.fn.clearInputs=function(t){var r=/^(?:color|date|datetime|email|month|number|password|range|search|tel|text|time|url|week)$/i;return this.each(function(){var a=this.type,n=this.tagName.toLowerCase();r.test(a)||"textarea"===n?this.value="":"checkbox"===a||"radio"===a?this.checked=!1:"select"===n?this.selectedIndex=-1:"file"===a?/MSIE/.test(navigator.userAgent)?e(this).replaceWith(e(this).clone(!0)):e(this).val(""):t&&(!0===t&&/hidden/.test(a)||"string"==typeof t&&e(this).is(t))&&(this.value="")})},e.fn.resetForm=function(){return this.each(function(){var t=e(this),r=this.tagName.toLowerCase();switch(r){case"input":this.checked=this.defaultChecked;case"textarea":return this.value=this.defaultValue,!0;case"option":case"optgroup":var a=t.parents("select");return a.length&&a[0].multiple?"option"===r?this.selected=this.defaultSelected:t.find("option").resetForm():a.resetForm(),!0;case"select":return t.find("option").each(function(e){if(this.selected=this.defaultSelected,this.defaultSelected&&!t[0].multiple)return t[0].selectedIndex=e,!1}),!0;case"label":var n=e(t.attr("for")),i=t.find("input,select,textarea");return n[0]&&i.unshift(n[0]),i.resetForm(),!0;case"form":return("function"==typeof this.reset||"object"==typeof this.reset&&!this.reset.nodeType)&&this.reset(),!0;default:return t.find("form,input,label,select,textarea").resetForm(),!0}})},e.fn.enable=function(e){return void 0===e&&(e=!0),this.each(function(){this.disabled=!e})},e.fn.selected=function(t){return void 0===t&&(t=!0),this.each(function(){var r=this.type;if("checkbox"===r||"radio"===r)this.checked=t;else if("option"===this.tagName.toLowerCase()){var a=e(this).parent("select");t&&a[0]&&"select-one"===a[0].type&&a.find("option").selected(!1),this.selected=t}})},e.fn.ajaxSubmit.debug=!1});
//# sourceMappingURL=jquery.form.min.js.map

// Set caret position easily in jQuery
// Written by and Copyright of Luke Morton, 2011
// Licensed under MIT
(function ($) {
    // Behind the scenes method deals with browser
    // idiosyncrasies and such
    $.caretTo = function (el, index) {
        if (el.createTextRange) { 
            var range = el.createTextRange(); 
            range.move("character", index); 
            range.select(); 
        } else if (el.selectionStart != null) { 
            el.focus(); 
            el.setSelectionRange(index, index); 
        }
    };
    
    // Another behind the scenes that collects the
    // current caret position for an element
    
    // TODO: Get working with Opera
    $.caretPos = function (el) {
        if ("selection" in document) {
            var range = el.createTextRange();
            try {
                range.setEndPoint("EndToStart", document.selection.createRange());
            } catch (e) {
                // Catch IE failure here, return 0 like
                // other browsers
                return 0;
            }
            return range.text.length;
        } else if (el.selectionStart != null) {
            return el.selectionStart;
        }
    };

    // The following methods are queued under fx for more
    // flexibility when combining with $.fn.delay() and
    // jQuery effects.

    // Set caret to a particular index
    $.fn.caret = function (index, offset) {
        if (typeof(index) === "undefined") {
            return $.caretPos(this.get(0));
        }
        
        return this.queue(function (next) {
            if (isNaN(index)) {
                var i = $(this).val().indexOf(index);
                
                if (offset === true) {
                    i += index.length;
                } else if (typeof(offset) !== "undefined") {
                    i += offset;
                }
                
                $.caretTo(this, i);
            } else {
                $.caretTo(this, index);
            }
            
            next();
        });
    };

    // Set caret to beginning of an element
    $.fn.caretToStart = function () {
        return this.caret(0);
    };

    // Set caret to the end of an element
    $.fn.caretToEnd = function () {
        return this.queue(function (next) {
            $.caretTo(this, $(this).val().length);
            next();
        });
    };
}(jQuery));
/*!
 * jQuery Cookie Plugin v1.4.1
 * https://github.com/carhartl/jquery-cookie
 *
 * Copyright 2013 Klaus Hartl
 * Released under the MIT license
 */
(function (factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD
		define(['jquery'], factory);
	} else if (typeof exports === 'object') {
		// CommonJS
		factory(require('jquery'));
	} else {
		// Browser globals
		factory(jQuery);
	}
}(function ($) {

	var pluses = /\+/g;

	function encode(s) {
		return config.raw ? s : encodeURIComponent(s);
	}

	function decode(s) {
		return config.raw ? s : decodeURIComponent(s);
	}

	function stringifyCookieValue(value) {
		return encode(config.json ? JSON.stringify(value) : String(value));
	}

	function parseCookieValue(s) {
		if (s.indexOf('"') === 0) {
			// This is a quoted cookie as according to RFC2068, unescape...
			s = s.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
		}

		try {
			// Replace server-side written pluses with spaces.
			// If we can't decode the cookie, ignore it, it's unusable.
			// If we can't parse the cookie, ignore it, it's unusable.
			s = decodeURIComponent(s.replace(pluses, ' '));
			return config.json ? JSON.parse(s) : s;
		} catch(e) {}
	}

	function read(s, converter) {
		var value = config.raw ? s : parseCookieValue(s);
		return $.isFunction(converter) ? converter(value) : value;
	}

	var config = $.cookie = function (key, value, options) {

		// Write

		if (value !== undefined && !$.isFunction(value)) {
			options = $.extend({}, config.defaults, options);

			if (typeof options.expires === 'number') {
				var days = options.expires, t = options.expires = new Date();
				t.setTime(+t + days * 864e+5);
			}

			return (document.cookie = [
				encode(key), '=', stringifyCookieValue(value),
				options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
				options.path    ? '; path=' + options.path : '',
				options.domain  ? '; domain=' + options.domain : '',
				options.secure  ? '; secure' : ''
			].join(''));
		}

		// Read

		var result = key ? undefined : {};

		// To prevent the for loop in the first place assign an empty array
		// in case there are no cookies at all. Also prevents odd result when
		// calling $.cookie().
		var cookies = document.cookie ? document.cookie.split('; ') : [];

		for (var i = 0, l = cookies.length; i < l; i++) {
			var parts = cookies[i].split('=');
			var name = decode(parts.shift());
			var cookie = parts.join('=');

			if (key && key === name) {
				// If second argument (value) is a function it's a converter...
				result = read(cookie, value);
				break;
			}

			// Prevent storing a cookie that we couldn't decode.
			if (!key && (cookie = read(cookie)) !== undefined) {
				result[name] = cookie;
			}
		}

		return result;
	};

	config.defaults = {};

	$.removeCookie = function (key, options) {
		if ($.cookie(key) === undefined) {
			return false;
		}

		// Must not alter options, thus extending a fresh object...
		$.cookie(key, '', $.extend({}, options, { expires: -1 }));
		return !$.cookie(key);
	};

}));

/*!
 * js-utils v1.2.2
 * https://github.com/hotmit/js-utils
 *
 * Copyright Du Dang
 * Released under the MIT license
 * https://github.com/hotmit/js-utils/LICENSE
 *
 * Date: 2017-04-26T17:25Z
 */

// STANDALONE: pure js

(function (global) {
    "use strict";

    var __JU, i, j, gVar, parts, curPart, curObj, _autoPopulateGlobal = true,

        // This value must be string comparable, ie. leave the padded zeros alone :)
        VERSION = 'v1.01.0',
        TYPE = 'JsUtils';

    // gettext place holder
    if (global.gettext === undefined){
        global.gettext = function(s){
            if (s == undefined){
                return '';
            }
            return s;
        };
    }

    function _removeFromVersionQueue (versionString){
        var index = global.JU._versionQueue.indexOf(versionString);
        if (index > -1){
            global.JU._versionQueue.splice(index, 1);
        }
    }

    // If this is the very first JU, the global variable "JU_autoPopulateGlobal" can be use to disable auto populate.
    // Any other case, use global.JU._autoPopulateGlobal to disable instead.
    if (!global.JU && global.hasOwnProperty('JU_autoPopulateGlobal'))
    {
        _autoPopulateGlobal = !!global['JU_autoPopulateGlobal'];
    }


    /**
     * Initialize Super Global Variable (Contains the repo of all JU versions)
     * @type {{_repo: Array, _versionQueue: Array, _autoPopulateGlobal: boolean, activate: function, deactivate: function, publish: function, get: function, remove: function, revert: function }}
     */
    global.JU = global.JU || {
            /**
             * The repository of all the version of JU currently available.
             */
            '_repo': [],

            /**
             * The order of activated JU version (this is use to revert back to older versions)
             */
            '_versionQueue': [],

            /**
             * Weather to put the library to the global object (ie. window.Str for example)
             */
            '_autoPopulateGlobal': _autoPopulateGlobal,

            /**
             * Global JU version.
             */
            '_version': VERSION,

            /**
             * Take the JU in the repo and put it in the specified target.
             *
             * @param target {!object} - where you want the lib functions to reside (commonly you want the window object to be the target)
             * @param versionString {?string=} - the version number you want to activate
             * @return {boolean}
             */
            activate: function(target, versionString)
            {
                var i, gVar, ju = global.JU.get(versionString), property;

                if (!ju || !target){
                    return false;
                }

                _removeFromVersionQueue(versionString);
                global.JU._versionQueue.push(ju.version);

				for (property in ju) {
					if (ju.hasOwnProperty(property)) {
						target[property] = ju[property];
					}
				}
				
                return true;
            },

            /**
             * Remove the lib functions from the target.
             *
             * @param target {!object} - the object to deactivate
             * @param versionString {?string=} - if not specify the latest version will be use.  Specify constant '*' to remove all version.
             * @returns {boolean}
             */
            deactivate: function(target, versionString){
                if (!target){
                    return false;
                }

                var removeAll = false, ju, i, gVar;
				
                if (versionString == '*'){
                    removeAll = true;
                    versionString = null;
                }

                ju = global.JU.get(versionString);
                if (!ju){
                    return false;
                }
				
                for(i=0; i<ju._globalVars.length; i++){
                    gVar = ju._globalVars[i];
                    if (gVar && gVar.indexOf('.') == -1 && target.hasOwnProperty(gVar)
                            && (target[gVar].hasOwnProperty('type') && target[gVar].type == TYPE)
                            && (removeAll || target[gVar].version == versionString))
                    {
                        delete target[gVar];
                    }
                }

                return true;
            },

            /**
             * Add the JU instance into the main repo.
             *
             * @param ju {!object}
             * @param populateGlobals {?boolean=} - put all the library into the global scope (ie __JU.Str into window.Str)
             * @param forcePush {?boolean=} - replace existing version in the repo
             */
            publish: function(ju, populateGlobals, forcePush){
                var version = ju.version, _repo = global.JU._repo;

                if (global.JU.get(version) && forcePush){
                    global.JU.remove(version);
                }

                if (!global.JU.get(version)){
                    _repo.push(ju);

                    // region [ Sort By Version ]
                    _repo.sort(function(a, b){
                        if (''.localeCompare){
                            return a.toString().localeCompare(b.toString());
                        }

                        if (a.toString() < b.toString()) {
                            return -1;
                        }
                        if (a.toString() > b.toString()) {
                            return 1;
                        }
                        return 0;
                    });
                    // endregion
                }

                if (populateGlobals){
                    global.JU.activate(global, version);
                }
            },

            /**
             * Get JU by version number.
             *
             * @param versionString {?string=} - if not specified then get the latest version.
             * @returns {object|null}
             */
            get: function(versionString)
            {
                var i, _repo = global.JU._repo;
                if (!_repo) {
                    return null;
                }

                if (!versionString) {
                    return _repo[_repo.length - 1];
                }

                for (i = 0; i < _repo.length; i++) {
                    if (_repo[i].version == versionString) {
                        return _repo[i];
                    }
                }
                return null;
            },

            /**
             * Remove the JU from the repo.
             *
             * @param versionString {?string=} - the version to remove, undefined to remove latest.
             * @returns {object}
             */
            remove: function(versionString){
                var i, _repo = global.JU._repo, ju;
                if (!_repo) {
                    return null;
                }

                if (!versionString){
                    ju = global.JU.get();
                    if (!ju){
                        return null;
                    }
                    versionString = ju.version;
                }

                for (i = 0; i < _repo.length; i++) {
                    if (_repo[i].version == versionString) {
                        _removeFromVersionQueue(versionString);
                        global.JU.deactivate(global, versionString);
                        return _repo.splice(i, 1);
                    }
                }
                return null;
            },

            /**
             * Go back to older version in the queue, if it is the last version
             * then just remove without activate new one.
             *
             * @param populateGlobals {?boolean=} - put all the library into the global scope (ie __JU.Str into window.Str)
             * @returns {object|null} - return the removed version of JU
             */
            revert: function(populateGlobals){
                var _repo = global.JU._repo, queue = global.JU._versionQueue, version, ju;
                if (_repo.length > 0 && queue.length > 0) {
                    version = queue.pop();

                    while (queue.length) {
                        ju = global.JU.get(version);
                        if (!ju) {
                            version = queue.pop();
                            continue;
                        }

                        // remove the old version from the global object (if it exist)
                        global.JU.deactivate(global, version);

                        if (populateGlobals && queue.length){
                            version = queue[queue.length - 1];
                            global.JU.activate(global, version);
                        }

                        return ju;
                    }
                }
                return null;
            }
        }; // END: New JU Object


    /**
     * The instance for constructing the library in the current version
     * @type {{_globalVars: string[], version: string, type: string,
     *          Arr, Dt, Fn, Obj, Pref, Slct, Stl, Str, Tmr, Typ, UI: {Bs, Patterns}, Utl}}
     */
    __JU = {
        '_globalVars': ['Arr', 'Dt', 'Fn', 'Obj', 'Pref', 'Slct', 'Stl', 'Str', 'Tmr', 'Typ', 'UI', 'UI.Bs', 'UI.Patterns',
            'Utl'],

        'version': VERSION,
        'type': TYPE
    };

    //region [ Initialize Lib Structure ]
    for (i = 0; i < __JU._globalVars.length; i++) {
        gVar = __JU._globalVars[i];

        if (gVar) {
            if (gVar.indexOf('.') == -1) {
                __JU[gVar] = {
                    'version': VERSION,
                    'class': gVar,
                    'type': TYPE
                }
            }
            else {
                curObj = __JU;
                parts = gVar.split('.');
                for (j = 0; j < parts.length; j++) {
                    curPart = parts[j];
                    if (!curObj.hasOwnProperty(curPart)){
                        curObj[curPart] = {
                            'version': VERSION,
                            'class': curPart,
                            'type': TYPE
                        };
                    }
                    curObj = curObj[curPart];
                }
            }
        }
    }
    //endregion

    /**
     * The instance for constructing the library in the current version
     * @type {{_globalVars: string[], version: string, type: string,
     *          Arr, Dt, Fn, Obj, Pref, Slct, Stl, Str, Tmr, Typ, UI: {Bs, Patterns}, Utl}}
     */
    global.JU.__JU = __JU;

}(typeof window !== 'undefined' ? window : this));
/*global jQuery, JU.__JU, setTimeout */

// STANDALONE: pure js


(function (global, Tmr) {
    "use strict";

    /**
     * Just like setTimeout except it has the argument to override the this instance
     *
     * @param func {function} - "this" is the specified "thisArg"
     * @param delay {number} - in millisecond
     * @param thisArg {object=} - similar to $.proxy, supply "this" for func
     * @returns {number} - setTimeout instance, use clearTimeout
     */
    Tmr.run = function(func, delay, thisArg){
        return setTimeout(function(){ func.call(thisArg || this); }, delay);
    };

}(typeof window !== 'undefined' ? window : this, JU.__JU.Tmr));

/*global jQuery, JU.__JU */

// STANDALONE: pure js


/**
	// Source: http://www.php.net/manual/en/function.date.php

	// Day
	d	01 to 31
	D	Mon through Sun
	j	1-31
	l (lowercase 'L')	Sunday through Saturday
			N print number 1 (for Monday) through 7 (for Sunday) (Not implemented)
	N	Ngay bang Tieng Viet => Thu Hai - Chua Nhat (Dup, Non Standard)
	S  day of month st, nd, rd, th  (Not implemented)
			w print number 1 (for Monday) through 7 (for Sunday) (Not implemented)
			z day of year  (Not implemented)
			W week number in the year

	// Month
	F	January through December
	m	01 through 12
	M	Jan through Dec
	n	1 through 12
	T	Thang bang Tieng Viet => Thang Mot - Thang Muoi Hai (Non Standard)
		t total number of days in the month  28 through 31 (Not implemented)

	// Year
	Y	1999 or 2003
	y	99 or 03
			L 1 if it is a leap year, 0 otherwise. (Not implemented)

	// Time
	a	am or pm
	A	AM or PM
	g	1 through 12	hour/12
	G	0 through 23	hour/24
	h	01 through 12	pad hour/12
	H	00 through 23	pad hour/24
	i	00 to 59		pad minute
	s	00 to 59		pad second

	// Time Zone
	O	+0200 	<= utc + 2hours
	P	+02:00

	// Time
	c	2004-02-12 15:19:21+00:00	php=2004-02-12T15:19:21+00:00
	r	Thu, 21 Dec 2000 16:01:07 +0200
	q	2001-03-10 17:16:18	Y-m-d H:i:s	mysql date  (Non Standard)
	o	2004-02-12		Y-m-d  (Dup, Non Standard)
	t	5:34pm			g:ia  (Dup, Non Standard)
*/

(function (global, $, Dt) {
    "use strict";


    var _dayShort 	= ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        _dayLong 	= ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        _dayViet 	= ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chúa Nhật'],
        _monthShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        _monthLong 	= ['January', 'February', 'March', 'April', 'May', 'June',
                     'July', 'August', 'September', 'October', 'November', 'December'];

    /**
     * Get a array of all the parts of a date. (N for viet day)
     *
     * @param d {Date}- the date object.
     * @returns {object}
     */
    Dt.getDateParts = function(d){
        var o = {}, j = d.getDate(),
            w = d.getDay(), GG = d.getHours(),
            n = d.getMonth(), Y = d.getFullYear(),

            // 12 hour format
            g = GG <= 12 ? GG : GG - 12,
            tz = d.getTimezoneOffset() / 60,
            tzSign = tz < 0 ? '-' : '+';

        g = g == 0 ? 12 : g;

        // timezone
        tz = Math.abs(tz);

        o.d = Dt.padZero(j);
        o.D = _dayShort[w];
        o.j = j;
        o.l = _dayLong[w];
        o.N = _dayViet[w];

        o.F = _monthLong[n];
        o.m = Dt.padZero(n+1);
        o.M = _monthShort[n];
        o.n = n+1;
        o.T = 'Tháng ' + (n+1);

        o.Y = Y;
        o.y = Y.toString().substring(2);

        o.a = GG < 12 ? 'am' : 'pm';
        o.A = GG < 12 ? 'AM' : 'PM';
        o.g = g;
        o.G = GG;
        o.h = Dt.padZero(g);
        o.H = Dt.padZero(GG);
        o.i = Dt.padZero(d.getMinutes());
        o.s = Dt.padZero(d.getSeconds());

        o.O = tzSign + Dt.padZero(tz) + '00';
        o.P = tzSign + Dt.padZero(tz) + ':00';

        o.c = o.Y+'-'+o.m+'-'+o.d+' '+o.H+':'+o.i+':'+o.s+o.P;
        o.r = o.D+', '+o.j+' '+o.M+' '+o.Y+' '+o.H+':'+o.i+':'+o.s+' '+o.O;
        o.q = o.Y+'-'+o.m+'-'+o.d+' '+o.H+':'+o.i+':'+o.s;
        o.o = o.Y+'-'+o.m+'-'+o.d;
        o.t = o.g+':'+o.i+o.a;

        return o;
    };

    /**
     * Get the utc equivalent of getDateParts().
     *
     * @param d {Date} - the local date time.
     */
    Dt.getUtcParts = function(d){
        var utc = Dt.toUtc(d),
            o = Dt.getDateParts(utc);

        o.O = '+0000';
        o.P = '+00:00';
        o.c = o.c.substring(0, 19) + o.O;
        o.r = o.r.substring(0, 26) + o.P;

        return o;
    };

    /**
     * Convert to utc, but the getTimezoneOffset() is not zero, but the date and time is utc.
     *
     * @param d {Date} - local date object
     */
    Dt.toUtc = function(d)
    {
        // convert minute into ms
        var offset = d.getTimezoneOffset() * 60000;
        return new Date(d.getTime() + offset);
    };

    /**
     * Two dates has the same year, month and day.
     * @param d1 {Date}- date object
     * @param d2 {Date}- date object
     * @returns {boolean}
     */
    Dt.isSameDate = function(d1, d2)
    {
        return  d1.getFullYear() == d2.getFullYear()
                && d1.getMonth() == d2.getMonth()
                &&  d1.getDate() == d2.getDate();
    };
    /**
     * Two dates has the same year, month and day.
     * @param e1 {number} - milliseconds since 1970 (unix epoch). Note php time() is in seconds not milliseconds.
     * @param e2 {number} - milliseconds since 1970 (unix epoch). Note php time() is in seconds not milliseconds.
     * @returns {boolean}
     */
    Dt.epochSameDate = function(e1, e2){
        var d1 = new Date(e1),
            d2 = new Date(e2);

        return Dt.isSameDate(d1, d2);
    };

    /**
     * Add a zero to the front if it is a single digit.
     * @param s {number|string} - the number or string.
     * @returns {String}
     */
    Dt.padZero = function(s){
        s = s.toString();
        return s.length == 2 ? s : '0' + s;
    };

    /**
     * Is Date data type
     * @param o {object} - the object to test.
     * @returns {boolean}
     */
    Dt.isDate = function(o){
        return Object.prototype.toString.call(o) === "[object Date]";
    };

    /**
     * Test to see if the date is valid. Usually it bad date
     * when the string use to create the date object is bad (ie not valid date format).
     * Example: new Date("hello world");
     *
     * @param d {Date} - the date object
     * @returns {boolean}
     */
    Dt.isValid = function(d){
        if (Dt.isDate(d)){
            // d = new Date("junk") => d.getTime() return NaN
            return !isNaN(d.getTime());
        }
        return false;
    };

    /**
     * Format date according to the format string.
     * @param d {Date} - date
     * @param format {string} - format string, for format look up php date() (this function doesn't support all format)
     * MAKE SURE to double escape the backslash ie if you want to escape a letter 'h' => '\\h'
     * @return {string}
     */
    Dt.format = function(d, format){
        if (!Dt.isValid(d)){
            return format;
        }

        var p = Dt.getDateParts(d),
            result = format.replace(/(\\?)([dDjlNFmMnTYyaAgGhHisOPcrqot])/g, function (whole, slash, key){
                        // no slash
                        if (!slash){
                            return p[key];
                        }

                        // if slash exist ie this is an escaped char
                        // return just the letter as a literal
                        return key;
                    });

        // remove any unnecessary backslashes
        result = result.replace(/\\([a-z])/gi, '$1');

        return result;
    };

}(typeof window !== 'undefined' ? window : this, jQuery, JU.__JU.Dt));


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
/*global jQuery, JU.__JU, Node, HTMLElement */

// STANDALONE: jq


(function (global, $, Typ) {
    "use strict";

    /**
     * Is jQuery object
     * @param o
     * @returns {boolean}
     */
    Typ.isJquery = function(o){
        return o instanceof jQuery;
    };

    /**
     * Is js object
     * @param o
     * @returns {boolean}
     */
    Typ.isObj = function(o){
        return $.type(o) === 'object';
    };

    /**
     * Is string
     * @param o
     * @returns {boolean}
     */
    Typ.isStr = function(o){
        return $.type(o) === 'string';
    };

    /**
     * Is function
     * @param o
     * @returns {boolean}
     */
    Typ.isFunc = function(o){
        return $.type(o) === 'function';
    };

    /**
     * Is regex
     * @param o
     * @returns {boolean}
     */
    Typ.isRegex = function(o){
        return $.type(o) === 'regexp';
    };

    /**
     * Is number
     * @param o
     * @returns {boolean}
     */
    Typ.isNumber = function(o){
        return $.type(o) === 'number';
    };

    /**
     * Is integer
     * @param o
     * @returns {boolean}
     */
    Typ.isInt = function(o){
        return Typ.isNumber(o) && o%1 === 0;
    };

    /**
     * Is float
     * @param o
     * @returns {boolean}
     */
    Typ.isFloat = function(o){
        return Typ.isNumber(o) && !Typ.isInt(o);
    };

    /**
     * Is date
     * @param o
     * @returns {boolean}
     */
    Typ.isDate = function(o){
        return $.type(o) === 'date';
    };

    /**
     * Is boolean
     * @param o
     * @returns {boolean}
     */
    Typ.isBool = function(o){
        return $.type(o) === 'boolean';
    };

    /**
     * Is array
     * @param o
     * @returns {boolean}
     */
    Typ.isArray = function(o){
        return $.type(o) == 'array';
    };

    /**
     * Is node
     * @param o
     * @returns {boolean}
     */
    Typ.isNode = function(o){
        return typeof Node === "object" ? o instanceof Node :
            o && typeof o === "object" && typeof o.nodeType === "number" && typeof o.nodeName === "string";
    };

    /**
     * Is html element
     * @param o
     * @returns {boolean}
     */
    Typ.isElement = function(o){
        return typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
            o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName==="string";
    };

    /**
     * Check see if the object is the ajax command object.
     *
     * @param o
     * @returns {boolean}
     */
    Typ.isAjaxCommand = function(o){
        return !!(o != undefined && o != false && !Typ.isStr(o)
                    && o.isAjaxCommand && o.options != undefined
                    && o.displayMethod != undefined && o.command != undefined);
    };

}(typeof window !== 'undefined' ? window : this, jQuery, JU.__JU.Typ));



/*global jQuery, JU.__JU, Str */

// REQ: jq, str

(function (global, $, Arr, Str) {
    "use strict";

    /**
     * Is array
     *
     * @param o {object}
     * @returns {boolean}
     */
    Arr.isArray = function(o){
        if (Array.isArray){
            return Array.isArray(o);
        }
        return $.type(o) == 'array';
    };

    /**
     * Useful when run for IN loop, to determine the key is the property
     * of that and not something inherited.
     *
     * @param arr {Array} - the array
     * @param prop {string} - property name/index/key
     * @return {boolean}
     */
    Arr.isProp = function(arr, prop){
        return arr.hasOwnProperty(prop);
    };

    /**
     * Loop through the array and check for the hasOwnProperty() as well.
     *
     * @param arr {Array} - the array
     * @param func {function(this:Array, item, asc_key:string, index:number):boolean}
     * 		- "this" refer to the arr, return false to break the loop
     */
    Arr.each = function(arr, func){
        var i=0, k, r;
        for(k in arr){
            if (arr.hasOwnProperty(k)){
                r = func.call(arr, arr[k], k, i);

                if (r === false){
                    break;
                }
                i++;
            }
        }
    };

    /**
     * Loop through the list of jQuery objects.
     *
     * @param jqObj {jQuery} - the jQuery list
     * @param func {function(this:jQuery, jqElm:jQuery, domElm:HTMLElement, index:number):boolean}
     * 		- "this" refer to the jqObj collection, return false to break the loop
     */
    Arr.eachJq = function(jqObj, func){
        var i, r, len;
        if (jqObj == undefined || !(jqObj instanceof jQuery)){
            return null;
        }

        for(i=0, len=jqObj.length; i<len; i++){
            r = func.call(jqObj, jqObj.eq(i), jqObj.get(i), i);

            if (r === false){
                break;
            }
        }
    };

    /**
     * Create an array out of a range of number.
     * eg. range(10) 	=> [0,2 .. 8, 9] len==10
     *     range(1,3) 	=> [1,2]
     *     range(1,7,2)	=> [1,3,5]
     *
     * @param start {!number}
     * @param end {?number=} - non-inclusive
     * @param step {?number=}
     * @return {Array}
     */
    Arr.range = function (start, end, step) {
        if (end == undefined){
            end = start;
            start = 0;
        }

        if (step == undefined){
            step = 1;
        }

        var arr = [], val=start;
        while(val<end){
            arr.push(val);
            val+= step;
        }

        return arr;
    };

    /**
     * Join the array together to make a string.
     *
     * @param arr {!Array<string>}
     * @param glue {string=}
     */
    Arr.implode = function(arr, glue){
        glue = glue == undefined ? ', ' : glue;
        return arr.join(glue);
    };

    /**
     * Split the array into multiple smaller arrays with the specified trunk size length (modify arr).
     *  eg. [1,2,3,4,5] trunk size 2 => [[1,2], [3,4], [5]]
     *
     * @param arr {!Array} - this array will be emptied at the end.
     * @param chunkSize {number}
     * @returns {Array<Array>}
     */
    Arr.chop = function(arr, chunkSize){
        var result = [], chunk;
        while(arr.length){
            chunk = arr.splice(0, chunkSize);
            result.push(chunk);
        }
        return result;
    };

    /**
     * Split arr into chunks (leave arr intact)
     *
     * @param arr {!Array}
     * @param chunkSize {number}
     * @returns {Array}
     */
    Arr.chunks = function (arr, chunkSize) {
        var result = [];
        for (var i=0, len=arr.length; i<len; i+=chunkSize){
            result.push(arr.slice(i, i+chunkSize));
        }
        return result;
    };

    /**
     * Remove any emptied items in the array
     *
     * @param arr {Array} - the array to trimf
     * @param callback {?function} - optional test function(element), return true to keep the item.
     * @returns {Array}
     */
    Arr.trim = function(arr, callback){
        var i, result = [];
        if (!arr){
            return result;
        }
        callback = callback || function(elm){
                return !Str.empty(elm);
            };
        for(i=0; i<arr.length; i++){
            var itm = arr[i];
            if (callback.call(itm, itm)){
                result.push(itm);
            }
        }
        return result;
    };
}(typeof window !== 'undefined' ? window : this, jQuery, JU.__JU.Arr, JU.__JU.Str));
/*global jQuery, JU.__JU, Utl, Typ  */

// REQ: jq, utils, type


(function (global, $, Fn, Utl, Typ) {
    "use strict";

    /**
     * Similar to function.call but it checks for undefined function
     *
     * @param func {?function} - the function
     * @param thisArg {object}
     * @param argArray {..object=} - the arguments objects
     * @returns {*}
     */
    Fn.call = function(func, thisArg, argArray){
        var args = [].slice.call(arguments).splice(2);
        return Fn.apply(func, thisArg, args);
    };

    /**
     * Similar to function.apply but it checks for undefined function
     *
     * @param func {?function}
     * @param thisArg {object}
     * @param argArray {?object|Array=}
     * @returns {*}
     */
    Fn.apply = function (func, thisArg, argArray){
        if (func != undefined && $.type(func) === 'function'){
            if (argArray == undefined){
                argArray = [];
            }
            else if ($.type(argArray) != 'array'){
                argArray = [argArray];
            }
            return func.apply(thisArg, argArray);
        }
    };

    /**
     * Execute a function by name (supports "Obj.sub.runMe")
     * @param funcName {?string} - name of the function (supports "Obj.sub.runMe")
     * @param context {?object} - pass "window" object to gain access to global object's functions
     * @param argArray {...object=}
     * @returns {*}
     */
    Fn.callByName = function(funcName, context, argArray){
        if (funcName == undefined || !funcName){
            return;
        }

        context = context || global;
        var args = [].slice.call(arguments).splice(2),
            namespaces = funcName.split("."),
            func = namespaces.pop(), i;

        for(i = 0; i < namespaces.length; i++){
            context = context[namespaces[i]];
            if (context == undefined){
                return;
            }
        }

        if (context[func] && $.isFunction(context[func])) {
            return context[func].apply(context, args);
        }
    };

    /**
     * Execute a function by name (supports "Obj.sub.runMe")
     *
     * @param funcName {?string} - name of the function (supports "Obj.sub.runMe")
     * @param context {?object} - pass "window" object to gain access to global object's functions
     * @param argArray {Array=} - the array of the args
     * @returns {*}
     */
    Fn.applyByName = function(funcName, context, argArray){
        if (funcName == undefined || !funcName){
            return;
        }

        context = context || global;
        var namespaces = funcName.split("."),
            func = namespaces.pop(), i;
        for(i = 0; i < namespaces.length; i++) {
            context = context[namespaces[i]];
            if (context == undefined){
                return;
            }
        }

        if (context[func] && $.isFunction(context[func])) {
            return context[func].apply(context, argArray);
        }
    };

    /**
     * Combine multiple functions together and run one after another,
     * all functions must have the same parameters.
     *
     * @param thisArg {object}
     * @param arrArray {Array=} - pass the arguments of the previous function
     * @param args {Array<function>}
     */
    Fn.chain = function(thisArg, arrArray, args){
        var f;
        args = Array.prototype.splice.call(arguments, 2);

        for (f in args) {
            if (args.hasOwnProperty(f)){
                if (f != undefined && $.type(f) === 'function') {
                    f.apply(thisArg, arrArray);
                }
            }
        }
    };

    /**
     /**
     * Attach your own function to existing functions.
     *  ie. good to latch your function to another function
     *
     * @param primaryFunc {function} - the main function, this function return will be the return on the final result
     * @param trailingFunc {function} - the latch function, the return value for this will be ignore
     * @param thisArgs {object} - the "this" object, the default is the reference to the primary function
     * @returns {function} - returns the combined function
     */
    Fn.combine = function(primaryFunc, trailingFunc, thisArgs){
        return function () {
            var args = Array.prototype.splice.call(arguments),
                primaryResult;

            if (primaryFunc){
                primaryResult = primaryFunc.apply(thisArgs || this, args)
            }
            trailingFunc.apply(thisArgs || this, args);
            return primaryResult;
        };
    };

    /**
     * Use this to hitch a list of functions to the end of another function,
     * but not certain if the main function exist.
     *  eg. global.factory.onLoad = Fn.combineWithContext(global, 'factory.onLoad', HideAfterLoad);
     *      once the "onLoad" function is execute it also execute the HideAfterLoad() function and return the result
     *      of the main onLoad function
     *
     * @param context {object} - the object the has the function
     * @param funcAttr {function} - the attribute name to retrieve the primary function
     * @param thisArg {object} - the "this" value
     * @param args - {function} - *args, list of all the functions you want to attach to the primary function
     * @returns {function}
     */
    Fn.combineWithContext = function(context, funcAttr, thisArg, args){
        var funcList = Array.prototype.splice.call(arguments, 3), primaryFunc = Utl.getAttr(context, funcAttr);

        // put the primary function in the front of the func list
        funcList.splice(0, 0, primaryFunc);

        // get the first non-null function in the array
        // eslint-disable-next-line no-empty
        while(!(funcList.length && (primaryFunc = funcList.shift()))){}

        if (!primaryFunc){
            // if nothing is specified then just return a dummy func
            return function(){};
        }

        return function(){
            var callArgs = Array.prototype.splice.call(arguments),
                result = primaryFunc.apply(thisArg || this, callArgs), secondaryFunc, i;

            for(i=0; i<funcList.length; i++){
                secondaryFunc = funcList[i];
                if (Typ.isFunc(secondaryFunc)){
                    secondaryFunc.apply(thisArg || this, callArgs);
                }
            }
            return result;
        }
    };

}(typeof window !== 'undefined' ? window : this, jQuery, JU.__JU.Fn, JU.__JU.Utl, JU.__JU.Typ));
/*global jQuery, JU.__JU */

// STANDALONE: jq


(function (global, $, Stl) {
	"use strict";

    /**
     * Add the style to the head (string -> css style text)
     * @param style {String|Array} - style text, http link or array of links
     */
    Stl.add = function(style){
        if ($.isArray(style))
        {
            $.each(style, function(i, elm){
                $('<link href="">').attr('href', elm).appendTo('head');
            });
        }
        else if ($.type(style) === 'string')
        {
            if (style.indexOf('http') == 0)
            {
                Stl.add([style]);
            }
            else
            {
                $('<style type="text/css">' + style + '</style>').appendTo('head');
            }
        }
    };

}(typeof window !== 'undefined' ? window : this, jQuery, JU.__JU.Stl));
/*global JU.__JU */

// STANDALONE: pure js

(function (global, Str) {
    "use strict";

    // region [ Private Functions ]
    /**
     * Test if the specified object is an array.
     * @param obj {Array|object}
     * @returns {boolean}
     * @private
     */
    function _isArray(obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
    }

    /**
     * Convert json string into js object.
     * @param s
     * @private
     */
    function _parseJson(s) {
        var _parser;
        if (typeof global.JSON !== 'undefined') {
            _parser = global.JSON.parse;
        }
        else if (typeof window.jQuery !== 'undefined') {
            _parser = window.jQuery.parseJSON;
        }

        if (typeof _parser === 'undefined') {
            throw 'Undefined JSON method';
        }
        return _parser(s);
    }

    // endregion

    /**
     * Check for undefined, null, zero length, blanks or s is false.
     * @param s {string|object} - string, array or object to test.
     * @returns {boolean}
     * Unit Test: http://jsfiddle.net/wao20/TGP3N/
     */
    Str.empty = function (s) {
        // s == undefined	 <= double equals is deliberate, check for null and undefined
        return !!(s == undefined
        || s.length === 0
        || Str.trim(s).length === 0
        || !s);

    };

    /**
     * Compare two strings
     * @param s1 {?string}
     * @param s2 {?string}
     * @param caseSensitive {boolean=}
     * @returns {boolean}
     */
    Str.equals = function (s1, s2, caseSensitive) {
        if (s1 == undefined || s2 == undefined) {
            return false;
        }

        if (caseSensitive) {
            return s1 == s2;
        }
        return s1.toLowerCase() == s2.toLowerCase();
    };

    /**
     * empty(), '0', '0.0', 'false' => false. Otherwise return !!s.
     *
     * @param s {?string}
     * @returns {boolean}
     */
    Str.boolVal = function (s) {
        if (Str.empty(s)) {
            return false;
        }
        s = Str.trim(s).toLowerCase();
        if (s == '0' || s == '0.0' || s == 'false') {
            return false;
        }
        return !!s;
    };

    /**
     * Escape the string to be use as a literal in regex expression.
     *
     * @param s {string|Array}
     * @returns {string|Array}
     */
    Str.regexEscape = function (s) {
        if (!s) {
            return '';
        }

        if (typeof s === 'string') {
            return s.replace(/([.?*+\^$\[\]\\(){}|\-])/g, '\\$1');
        }
        else if (_isArray(s)) {
            var result = [], i;
            for (i = 0; i < s.length; i++) {
                result.push(Str.regexEscape(s[i]));
            }
            return result;
        }
        return s;
    };

    /**
     * Tests whether the beginning of a string matches pattern.
     *
     * @param s {string}
     * @param pattern {string} - to find
     * @param caseSensitive {boolean=}
     * @return {boolean}
     */
    Str.startsWith = function (s, pattern, caseSensitive) {
        if (caseSensitive) {
            return s.indexOf(pattern) === 0;
        }
        return s.toLowerCase().indexOf(pattern.toLowerCase()) === 0;
    };

    /**
     * Test if string ends with specified pattern
     * @param s {string}
     * @param pattern {string}
     * @param caseSensitive {boolean=}
     * @returns {boolean}
     */
    Str.endsWith = function (s, pattern, caseSensitive) {
        var d = s.length - pattern.length;
        if (caseSensitive) {
            return d >= 0 && s.lastIndexOf(pattern) === d;
        }
        return d >= 0 && s.toLowerCase().lastIndexOf(pattern.toLowerCase()) === d;
    };

    /**
     * Check if the string contains a substring.
     * @param s {string}
     * @param needle {string}
     * @param caseSensitive {boolean=}
     * @return {boolean}
     */
    Str.contains = function (s, needle, caseSensitive) {
        if (Str.empty(s) || Str.empty(needle)) {
            return false;
        }
        if (caseSensitive) {
            return s.indexOf(needle) > -1;
        }
        return s.toLowerCase().indexOf(needle.toLowerCase()) > -1;
    };

    /**
     * Must contains all the element in the array.
     * @param s {string}
     * @param needles {Array|string}
     * @param caseSensitive {boolean=}
     * @return {boolean}
     */
    Str.containsAll = function (s, needles, caseSensitive) {
        var i = 0;
        if (_isArray(needles)) {
            for (i = 0; i < needles.length; i++) {
                if (!Str.contains(s, needles[i], caseSensitive)) {
                    return false;
                }
            }
            return true;
        }
        return Str.contains(s, needles, caseSensitive);
    };

    /**
     * Must contains ANY the element in the array.
     * @param s {string}
     * @param needles {Array|string}
     * @param caseSensitive {boolean=}
     * @return {boolean}
     */
    Str.containsAny = function (s, needles, caseSensitive) {
        var i;
        if (_isArray(needles)) {
            for (i = 0; i < needles.length; i++) {
                if (Str.contains(s, needles[i], caseSensitive)) {
                    return true;
                }
            }
            return false;
        }
        return Str.contains(s, needles, caseSensitive);
    };

    /**
     * Determine if the specified variable is a string
     * @param o
     * @returns {boolean}
     */
    Str.isString = function (o) {
        return typeof o === 'string';
    };

    /**
     * Trims white space from the beginning and end of a string.
     * @param s {string}
     * @param c {string=}
     * @return {string}
     */
    Str.trim = function (s, c) {
        if (!Str.isString(s)) {
            return s;
        }

        if (c == undefined || c == ' ') {
            if (String.prototype.trim) {
                return String.prototype.trim.call(s);
            }
            return s.replace(/^\s+/, '').replace(/\s+$/, '');
        }
        return Str.trimStart(Str.trimEnd(s, c), c);
    };

    /**
     * Remove chars/Str from the start of the string
     * @param s
     * @param c {string|Array=} - supports Str.trimStart(s, ['0x0', '0', 'x']);
     */
    Str.trimStart = function (s, c) {
        if (c == undefined || c == '') {
            return s.replace(/^\s+/, '');
        }

        var trims = c, regex, result;
        if (!_isArray(c)) {
            trims = [c];
        }
        trims = Str.regexEscape(trims).join('|');
        regex = '^(' + trims + '|\s)+';
        regex = new RegExp(regex, 'g');
        result = s.replace(regex, '');
        return result;
    };

    /**
     * Remove chars/Str(s) from the end of the string
     * @param s {string}
     * @param c {string|Array=} - supports Str.trimEnd(s, ['0x0', '0', 'x']);
     */
    Str.trimEnd = function (s, c) {
        if (c == undefined) {
            return s.replace(/\s+$/, '');
        }
        var trims = c, regex, result;
        if (!_isArray(c)) {
            trims = [c];
        }
        trims = Str.regexEscape(trims).join('|');
        regex = '(' + trims + '|\s)+$';
        regex = new RegExp(regex, 'g');
        result = s.replace(regex, '');
        return result;
    };

    /**
     * Extended substring, support negative index (ordinal js substr(startIndex, endIndex))
     *
     * @param s {string}
     * @param index {number} - if negative take string from the right similar to php substr()
     * @param len {number=} - number of char to take starting from the index to the right (even when index is negative)
     * @return {string}
     */
    Str.subStr = function (s, index, len) {
        if (s == undefined) {
            return '';
        }

        len = len || 0;

        if (Math.abs(index) > s.length) {
            return s;
        }

        // regular substring
        if (index > -1) {
            if (len > 0 && (index + len) < s.length) {
                return s.substring(index, index + len);
            }
            return s.substring(index);
        }

        // Negative index, take string from the right
        // Index is negative	=> subStr ('hello', -3)	=> 'llo'
        var start = s.length + index;
        if (len > 0 && (start + len) < s.length) {
            return s.substring(start, start + len);
        }
        return s.substring(start);
    };

    /**
     * Count number of occurrences of an substring.
     * @param s {string} - the big string
     * @param sub {string} - the little string you want to find.
     * @param caseSensitive {boolean=}
     * @returns {number}
     */
    Str.subCount = function (s, sub, caseSensitive) {
        sub = Str.regexEscape(sub);

        if (caseSensitive) {
            return s.split(sub).length - 1;
        }
        return s.toLowerCase().split(sub.toLowerCase()).length - 1;
    };

    /**
     * Concatenate count number of copies of s together and return result.
     * @param s {string}
     * @param count {number} - Number of times to repeat s
     * @return {string}
     */
    Str.repeat = function (s, count) {
        var result = '', i;
        for (i = 0; i < count; i++) {
            result += s;
        }
        return result;
    };

    /**
     * Pad left
     *
     * @param s {!string}
     * @param padStr {!string} - the padding
     * @param totalLength {!number} - the final length after padding
     * @return {string}
     */
    Str.padLeft = function (s, padStr, totalLength) {
        return s.length >= totalLength ? s : Str.repeat(padStr, (totalLength - s.length) / padStr.length) + s;
    };

    /**
     * Pad right
     *
     * @param s {string}
     * @param padStr {string} - the padding
     * @param totalLength {number} - the final length after padding
     * @return {string}
     */
    Str.padRight = function (s, padStr, totalLength) {
        return s.length >= totalLength ? s : s + Str.repeat(padStr, (totalLength - s.length) / padStr.length);
    };

    /**
     * Pad string based on the boolean value.
     *
     * @param s {string}
     * @param padStr {string} - the padding
     * @param totalLength {number} - the final length after padding
     * @param padRight {boolean} - pad right if true, pad left otherwise
     * @return {string}
     */
    Str.pad = function (s, padStr, totalLength, padRight) {
        if (padRight) {
            return Str.padRight(s, padStr, totalLength);
        }
        return Str.padLeft(s, padStr, totalLength);
    };

    /**
     * Strips any HTML tags from the specified string.
     * @param s {string}
     * @return {string}
     */
    Str.stripTags = function (s) {
        return s.replace(/<\/?[^>]+>/gi, '');
    };

    /**
     * escapeHTML from Prototype-1.6.0.2 -- If it's good enough for Webkit and IE, it's good enough for Gecko!
     * Converts HTML special characters to their entity equivalents.
     *
     * @param s {string}
     * @return {string}
     */
    Str.escapeHTML = function (s) {
        s = s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return s;
    };

    /**
     * unescapeHTML from Prototype-1.6.0.2 -- If it's good enough for Webkit and IE, it's good enough for Gecko!
     * Strips tags and converts the entity forms of special HTML characters to their normal form.
     *
     * @param s {string}
     * @return {string}
     */
    Str.unescapeHTML = function (s) {
        return Str.stripTags(s).replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
    };

    /**
     * Remove all Viet's accents and replace it with the latin based alphabet
     * @param s {string}
     * @return {string}
     */
    Str.stripViet = function (s) {
        /*
         data = data.replace(/[àáâãăạảấầẩẫậắằẳẵặ]/g, 'a');
         data = data.replace(/[òóôõơọỏốồổỗộớờởỡợ]/g, 'o');
         data = data.replace(/[èéêẹẻẽếềểễệ]/g, 'e');
         data = data.replace(/[ùúũưụủứừửữự]/g, 'u');
         data = data.replace(/[ìíĩỉị]/g, 'i');
         data = data.replace(/[ýỳỵỷỹ]/g, 'y');
         data = data.replace(/[đðĐ]/g, 'd');
         */

        if (Str.empty(s)) {
            return s;
        }

        s = s.replace(/[\u00E0\u00E1\u00E2\u00E3\u0103\u1EA1\u1EA3\u1EA5\u1EA7\u1EA9\u1EAB\u1EAD\u1EAF\u1EB1\u1EB3\u1EB5\u1EB7]/g, 'a');
        s = s.replace(/[\u00F2\u00F3\u00F4\u00F5\u01A1\u1ECD\u1ECF\u1ED1\u1ED3\u1ED5\u1ED7\u1ED9\u1EDB\u1EDD\u1EDF\u1EE1\u1EE3]/g, 'o');
        s = s.replace(/[\u00E8\u00E9\u00EA\u1EB9\u1EBB\u1EBD\u1EBF\u1EC1\u1EC3\u1EC5\u1EC7]/g, 'e');
        s = s.replace(/[\u00F9\u00FA\u0169\u01B0\u1EE5\u1EE7\u1EE9\u1EEB\u1EED\u1EEF\u1EF1]/g, 'u');
        s = s.replace(/[\u00EC\u00ED\u0129\u1EC9\u1ECB]/g, 'i');
        s = s.replace(/[\u00FD\u1EF3\u1EF5\u1EF7\u1EF9]/g, 'y');
        s = s.replace(/[\u0111\u00F0\u0110]/g, 'd');

        return s;
    };

    /**
     * Use this to constructs multi lines string
     *
     * eg. Str.multiLines(true,
     *                        'hello',
     *                        'world'
     *                        );
     *                    returns: "hello\nworld"
     *
     * @param glue {string} - the separator between each line (eg. '\n', ', ' or ' ')
     * @param args {...string} - each line
     */
    Str.multiLines = function (glue, args) {
        args = Array.prototype.splice.call(arguments, 1);
        return args.join(glue);
    };

    /**
     * Try to parse the json, if valid return the object else return defaultValue
     *
     * @param s {string} - json string
     * @param defaultValue {boolean|object=} - if not specified defaultValue=false
     * @returns {boolean|object}
     */
    Str.parseJson = function (s, defaultValue) {
        defaultValue = defaultValue === undefined ? false : defaultValue;
        if (Str.empty(s)) {
            return defaultValue;
        }

        try {
            if (typeof s === 'string') {
                return _parseJson(s);
            }

            // it already an object
            return s;
        }
        catch (err) {
            return defaultValue;
        }
    };

    /**
     * Escape the attribute, make sure it doesn't break the attribute select or to be use a an attribute.
     * @param s {string} - the string
     */
    Str.escapeAttribute = function (s) {
        return s.replace(/"/g, '\\"').replace(/'/g, '\\\'');
    };

    /**
     * Reverse the string.
     *
     * @param s
     * @returns {*}
     */
    Str.reverse = function (s) {
        if (s) {
            return s.split('').reverse().join('');
        }
        return s;
    };

    /**
     * Get all the matched based on the specified group.
     *
     * @param s {string}
     * @param regex {RegExp}
     * @param index {Number} - the index of the match.
     * @returns {Array}
     */
    Str.matchAll = function (s, regex, index) {
        var m, result = [];
        index = index || 0;

        if (!s) {
            return [];
        }

        while (m = regex.exec(s)) {
            result.push(m[index]);
        }
        return result;
    };

    /**
     * Split the string into multiple smaller chunks.
     *
     * @param s
     * @param chunkSize
     * @returns {Array}
     */
    Str.chop = function (s, chunkSize) {
        var regex;
        if (!s) {
            return [];
        }
        regex = new RegExp('.{1,' + chunkSize + '}', 'g');
        return s.match(regex);
    };

    function _getWords(s) {
        s = s.replace(/(\w)([A-Z][a-z])/, '$1-$2');
        s = s.replace(' ', '-');
        s = s.replace('_', '-');
        s = s.replace(/-+/g, '-');

        return s.split('-')
    }

    /**
     * Convert any string to camel case.
     *
     * @param s
     */
    Str.toCamelCase = function (s) {
        var words = _getWords(s), result = '', i, word;
        for (i = 0; i < words.length; i++) {
            word = words[i];
            if (i == 0) {
                result += word.toLowerCase();
            }
            else {
                result += word.charAt(0).toUpperCase() + word.substr(1).toLowerCase();
            }
        }
        return result;
    };

    /**
     * Convert any string to title case.
     *
     * @param s
     */
    Str.toTitleCase = function (s) {
        var words = _getWords(s), result = '', i, word;
        for (i = 0; i < words.length; i++) {
            word = words[i];
            result += word.charAt(0).toUpperCase() + word.substr(1).toLowerCase() + ' ';
        }
        return Str.trimEnd(result);
    };

    /**
     * Convert any string to snake case.
     *
     * @param s
     */
    Str.toSnakeCase = function (s) {
        var words = _getWords(s), result = '', i, word;
        for (i = 0; i < words.length; i++) {
            word = words[i];
            result += word.toLowerCase() + '_';
        }
        return Str.trimEnd(result, '_');
    };

    /**
     * Convert any string to-kebab-case.
     *
     * @param s
     */
    Str.toKebabCase = function (s) {
        var words = _getWords(s), result = '', i, word;
        for (i = 0; i < words.length; i++) {
            word = words[i];
            result += word.toLowerCase() + '-';
        }
        return Str.trimEnd(result, '-');
    };

}(typeof window !== 'undefined' ? window : this, JU.__JU.Str));
/*global jQuery, JU.__JU */

(function (global, Utl, Str) {
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
        attr = attr == undefined ? '' : attr.toString();

        if (obj && attr.length > 0){
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

    /**
     * Extract prefixed options from data or attr.
     *
     * @param obj - the object that contains the options
     * @param prefix - the prefix string
     * @param defaultOptions
     *
     * return: bsDialogTitle => { title: }
     */
    Utl.getPrefixedOptions = function(obj, prefix, defaultOptions){
        var opts = {};
        $.each(obj, function(key, value){
            if (Str.startsWith(key, prefix)){
                opts[Str.toCamelCase(key.replace(prefix, ''))] = value;
            }
        });
        return $.extend({}, defaultOptions || {}, opts)
    };

}(typeof window !== 'undefined' ? window : this, JU.__JU.Utl, JU.__JU.Str));
/*global jQuery, JU.__JU, Str */

// REQ: jq, str-standalone.js


(function (global, $, Slct, Str) {
    "use strict";

    /**
     * Get the selected value of a select element.
     *
     * @param selectElement {!selector|jQuery|HTMLElement|id|*} - the select box element
     * @returns {Array|object} - return array if multiple=multiple, else return the single value of the selected option.
     */
    Slct.getSelectedValues = function(selectElement){
        var $selectBox = $(selectElement), $selected = $selectBox.find('option:selected'),
            result = [], $firstOpt;

        if (Slct.isMultiple($selectBox)){
            $selected.each(function(index, element){
               result.push(element.value);
            });
            return result;
        }

        $firstOpt = $selected.first();
        if ($firstOpt.length){
            return $firstOpt.val();
        }
        return null;
    };

    // region [ _createOptions ]
    /**
     * Convert json into jQuery options.
     * @param options
     * @returns {jQuery}
     * @private
     */
    function _createOptions(options){
        /**
         * @type {jQuery}
         */
        var $options = $('<select multiple="multiple"></select>');

        $.each(options, function(index, opt){
            var $optGroup, $newOpt;
            if (opt.hasOwnProperty('optGroup')){
                $optGroup = $('<optgroup></optgroup>')
                    .attr('label', opt.label);

                if (opt.id != undefined){
                    $optGroup.attr('id', opt.id);
                }

                if (opt.options != undefined && opt.options.length){
                    $optGroup.append(_createOptions(opt.options));
                }

                $options.append($optGroup);
                return;
            }

            $newOpt = $('<option></option>')
                    .attr('value', opt.value)
                    .text(opt.name);

            if (opt.id != undefined){
                $newOpt.attr('id', opt.id);
            }

            if (opt.selected === true){
                $newOpt.attr('selected', 'selected');
            }

            $options.append($newOpt);
        });

        return $options.children();
    } // End _createOptions
    // endregion

    /**
     * Add options to select element.
     *
     * @param selectElement {!selector|jQuery|HTMLElement|id|*} - the select box element
     * @param options {Array} - [ { value: "value", name: "display text", selected: "optional bool" }, ...,
     *                            { optGroup: true, label: "optGroup label", id: "optional id", options: []}}
     */
    Slct.addOptions = function(selectElement, options){
        var $selectElement = $(selectElement),
            $options = _createOptions(options);
        $selectElement.append($options);
    };

    /**
     * Get options based on value or text.
     *
     * @param selectElement {id|HTMLElement|jQuery} - the select box element
     * @param input - text or option.value
     * @param byValue {boolean}
     * @param caseSensitive {boolean}
     * @returns {boolean}
     * @private
     */
    function _getOption(selectElement, input, byValue, caseSensitive){
        var result = false;
        $(selectElement).find('option').each(function(i, option){
            var $option = $(option);
            if (byValue){
                if (Str.equals($option.val(),  input, caseSensitive)){
                    result = $option;
                    return false;
                }
            }
            else {  // By Text
                if (Str.equals($option.text(),  input, caseSensitive)){
                    result = $option;
                    return false;
                }
            }
        });
        return result;
    }

    /**
     * Get the option by the option value.
     *
     * @param selectElement {id|HTMLElement|jQuery} - the select box element
     * @param value
     * @param caseSensitive
     * @returns {*}
     */
    Slct.getOptionByValue = function(selectElement, value, caseSensitive){
        return _getOption(selectElement, value, true, caseSensitive);
    };

    /**
     * Get the option by the option display text.
     *
     * @param selectElement {id|HTMLElement|jQuery} - the select box element
     * @param text
     * @param caseSensitive
     * @returns {*}
     */
    Slct.getOptionByText = function(selectElement, text, caseSensitive){
        return _getOption(selectElement, text, false, caseSensitive);
    };

    /**
     * Remove the option based on its value.
     *
     * @param selectElement {id|HTMLElement|jQuery} - the select box element
     * @param value {object} - the value of the option you want to remove.
     * @param caseSensitive - case sensitive comparison.
     */
    Slct.removeByValue = function(selectElement, value, caseSensitive){
        var $option = Slct.getOptionByValue(selectElement, value, caseSensitive);
        if ($option){
            $option.remove();
        }
    };

    /**
     * Remove option based on the display text.
     *
     * @param selectElement {id|HTMLElement|jQuery} - the select box element
     * @param text {string} - the text of the option you want to remove.
     * @param caseSensitive - case sensitive comparison.
     */
    Slct.removeByText = function(selectElement, text, caseSensitive){
        var $option = Slct.getOptionByText(selectElement, text, caseSensitive);
        if ($option){
            $option.remove();
        }
    };

    /**
     * Set option as selected based on its value.
     *
     * @param selectElement {id|HTMLElement|jQuery} - the select box element
     * @param value
     * @param caseSensitive
     * @returns {boolean}
     */
    Slct.selectByValue = function(selectElement, value, caseSensitive){
        var $option = Slct.getOptionByValue(selectElement, value, caseSensitive);
        if ($option){
            $option.prop('selected', true);
            return true;
        }
        return false;
    };

    /**
     * Set option as selected based on its display text.
     *
     * @param selectElement {id|HTMLElement|jQuery} - the select box element
     * @param text
     * @param caseSensitive
     * @returns {boolean}
     */
    Slct.selectByText = function(selectElement, text, caseSensitive){
        var $option = Slct.getOptionByText(selectElement, text, caseSensitive);
        if ($option){
            $option.prop('selected', true);
            return true;
        }
        return false;
    };

    /**
     * Select all options.
     *
     * @param selectElement
     */
    Slct.selectAll = function(selectElement){
        $(selectElement).find('option').prop('selected', true);
    };

    /**
     * Clear all selection.
     *
     * @param selectElement
     */
    Slct.selectNone = function(selectElement){
        $(selectElement).find('option').prop('selected', false);
    };

    /**
     * Check to see if the select box has any options.
     *
     * @param selectElement {id|HTMLElement|jQuery} - the select box element
     * @returns {boolean}
     */
    Slct.isEmpty = function(selectElement){
        return !$(selectElement).find('option').length;
    };

    /**
     * Determine if the select box allow multiple select.
     *
     * @param selector {id|HTMLElement|jQuery} - the select box selector
     * @returns {boolean}
     */
    Slct.isMultiple = function(selector){
        return $(selector).is('[multiple]');
    };

    /**
     * Auto save and load last selected index when page reload.
     *
     * @param selector {id|HTMLElement|jQuery} - the select box
     * @param cookieName {string} - the cookie name to store the selected options
     * @param region {id|HTMLElement|jQuery} - restrict to only elements with the specified region, default $('body')
     */
    Slct.autoSaveSelection = function(selector, cookieName, region){
        var $selectBox = $(selector), $region = $(region || 'body'),
            selectedValue = $.cookie(cookieName);

        if (!Str.empty(selectedValue)){
            if (Slct.isMultiple($selectBox)){
                selectedValue = selectedValue.split(',')
            }
            $selectBox.val(selectedValue).change();
        }

        $region.on('change', selector, function(){
            var selectedValue = $(this).val();
            if (selectedValue != null){
                if (Slct.isMultiple($selectBox)) {
                    selectedValue = selectedValue.join(',');
                }
                $.cookie(cookieName, selectedValue);
            }
            else {
                $.removeCookie(cookieName)
            }
        });
    }
}(typeof window !== 'undefined' ? window : this, jQuery, JU.__JU.Slct, JU.__JU.Str));
/*global jQuery, JU.__JU, Base64, Str, Dt */

// REQ: jq, date.js, str-standalone.js


(function (global, $, Str) {
    "use strict";

    /**
     * String to hex
     *
     * @param s {string}
     * @return {string}
     */
    Str.toHex = function(s){
        var r = '', i;
        for(i=0; i<s.length; i++){
            r += s.charCodeAt(i).toString(16);
        }
        return r;
    };

    /**
     * Convert hex string into string.
     *
     * @param hex {string} - the hex string
     * @return {string}
     */
    Str.fromHex = function(hex){
        var r = '', i;
        for (i=0; i < hex.length; i+=2){
            r += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
        }
        return r;
    };

    /**
     * Try to emulate C# String.format() function
     * @param s {string} - the format string
     * @param args {...object} - the input for the place holder
     * @return {string}
     */
    Str.format = function(s, args){
        args = Array.prototype.splice.call(arguments, 1);

        // Syntax: {0}	or 	{0:format string}
        // Replace place holder with actual value from the parameters
        s = s.replace(/\{(\d+)(:([^}]+?))?}/g, function (match, index, format, style) {
            if (index < args.length && args[index] != undefined){
                if (!format){
                    return args[index];
                }
                return Str.formatObject(args[index], style);
            }
            return match;
        });

        // Syntax: {index.key}	or 	{index.key:format string}
        // 		eg. {0.name}
        // Index of object or an array
        s = s.replace(/\{(\d+)\.([a-zA-Z0-9_]+)(:([^}]+?))?}/g, function (match, index, key, format, style) {
            if (index < args.length && args[index] != undefined && args[index].hasOwnProperty(key)){
                if (!format){
                    return args[index][key];
                }
                return Str.formatObject(args[index][key], style);
            }
            return match;
        });

        /*
        Samples
        var a = Str.format("hello {0} {1} {0} {0}", "yo", "dude");
        alert(a);
        a = Str.format("hello {0.name} {0.age}", {name: "john", age: 10});
        alert(a);
        a = Str.format("hello {0.1} {0.0}", ["first", "last"]);
        alert(a);
        */

        return s;
    };

    /**
     * Format the object
     * @param o {Date|object} - the object
     * @param format {string} - the format string
     * @return {string}
     */
    Str.formatObject = function(o, format){
        if (o == undefined){
            return '';
        }

        if (Dt.isValid(o)){
            return Dt.format(o, format);
        }

        /*
        // Number
        String.Format("{0:00000}", 15);          		// "00015"
        String.Format("{0:00000}", -15);         		// "-00015"
        String.Format("{0:0aaa.bbb0}", 12.3);		// "12aaa.bbb3"
        String.Format("{0:0,0.0}", 12345.67);     	// "12,345.7"
        String.Format("{0:0,0}", 12345.67);       	// "12,346"
        String.Format("{0:0.##}", 123.4567);      	// "123.46"
        String.Format("{0:0.##}", 123.4);         		// "123.4"
        String.Format("{0:0.##}", 123.0);         		// "123"
        String.Format("{0:00.0}", -3.4567);       	// "-03.5"

        0:x16	=> base 16
        0:x2	=> binary

        parseFloat(string, base)
        parseInt(string, base)	<= return NaN on modern browser old old browser return 0 (ie3)

        display: 0x hex    -0x octal
        */
        return o.toString();
    };


    /* Relocate to cookie to reduce readability
     * (function(){
        var v =['Str','.','m','t','x'].join('');
        // add these values to the front of the array, and remove last element
        eval(v+'.unshift(69, 118, 101, 114);'); eval(v+'.pop();'); v = undefined;
    })();*/

}(typeof window !== 'undefined' ? window : this, jQuery, JU.__JU.Str));

/*global jQuery, JU.__JU, Str, Dt */

// REQ: str-standalone.js


(function (global, $, Str) {
    "use strict";

    Str.mtx = [121, 111, 110, 101, 32, 105, 115, 32, 97,
        32, 103, 101, 110, 105, 117, 115, 32, 97, 116, 32, 108, 101,
        97, 115, 116, 32, 111, 110, 99, 101, 32, 97, 32, 121, 101,
        97, 114, 46, 32, 84, 104, 101, 32, 114, 101, 97, 108, 32, 103,
        101, 110, 105, 117, 115, 101, 115, 32, 115, 105, 109, 112,
        108, 121, 32, 104, 97, 118, 101, 32, 116, 104, 101, 105, 114,
        32, 98, 114, 105, 103, 104, 116, 32, 105, 100, 101, 97, 115,
        32, 99, 108, 111, 115, 101, 114, 32, 116, 111, 103, 101, 116,
        104, 101, 114, 46, 32, 226, 128, 148, 32, 71, 101, 111, 114,
        103, 32, 67, 104, 114, 105, 115, 116, 111, 112, 104, 32, 76,
        105, 99, 104, 116, 101, 110, 98, 101, 114, 103, 11];

    /**
     * Scramble the string to hide content from spying eyes
     * @param s {string}
     * @param breakLine {boolean=} - link break to avoid long one liner
     * @return {string}
     */
    Str.fuzzit = function(s, breakLine){
        /*jslint bitwise: true */
        breakLine = !!breakLine;

        var r = '', k=s.length, jk=[3,5,8,13,21,34,55,89,144], j=0,
                sl=k, ch=0, i, c, ml=Str.mtx.length;
        for(i=0; i<s.length; i++,k++){
            c = s.charCodeAt(i) ^ Str.mtx[k%ml];
            r += Str.padLeft(c.toString(16), String.fromCharCode(103), 2);
            ch++;
            if (ch%20===0&&ch!==0&&breakLine){
            r += "\r\n";
            }
            if ((i+sl)%jk[j] === 0){
            r += String.fromCharCode(104+(jk[j]+i+sl)%18);
            j = (j+1)%jk.length;
            ch++;
            if (ch%20===0&&ch!==0&&breakLine){
                r += "\r\n";
            }
            }
        }
        /*jslint bitwise: false */
        return r;
    };

    /**
     * Decode Str.fuzzit() function
     * @param s {string} - the obfuscated string
     * @return {string}
     */
    Str.unfuzzit = function(s){
        /*jslint bitwise: true */
        s = s.replace(/[^0-9a-gA-G]/g, '');
        if (s.length%2 !== 0){
            return 'error';
        }
        var r = '',k=s.length/2, i, c, ml=Str.mtx.length;
        for(i=0; i<s.length; i+=2,k++){
            c = ((s[i]=='g'||s[i]=='G')?'0':s[i])+s[i+1];
            r += String.fromCharCode(parseInt(c, 16) ^ Str.mtx[k%ml]);
        }
        /*jslint bitwise: false */
        return r;
    };

    Str.mtx.unshift(69, 118, 101, 114);
    Str.mtx.pop();

}(typeof window !== 'undefined' ? window : this, jQuery, JU.__JU.Str));

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

/*global jQuery, JU.__JU */

// REQ: jq, block-ui


(function (global, $, UI) {
    "use strict";

    UI.lightOverlayCSS = {
        background: '#eee url(/static/lazifier/images/ajax-loader.gif) no-repeat center',
        backgroundSize: '16px 16px',
        opacity: 0.5
    };

    UI.darkOverlayCSS = {
        background: '#000 url(/static/lazifier/images/ajax-loader.gif) no-repeat center',
        backgroundSize: '16px 16px',
        opacity: 0.6
    };

    UI.defaultBlockOpts = {
        message: null,
        overlayCSS: UI.lightOverlayCSS
    };

    function _prepBlockUIOptions(options) {
        if ($.type(options) === 'string') {
            options = {
                message: options
            };
        }

        options = $.extend({}, UI.defaultBlockOpts, options);
        return options;
    }

    /**
     * Overlay the loading screen over the element.
     * @param elm {?selector|HTMLElement|jQuery=} - the element to cover,
     *                                              or pass null/undefined to cover the entire screen
     * @param options {?string|object=} - "undefined" just loading no text, "string" text with default option
     *                                          Options reference http://malsup.com/jquery/block/#options
     */
    UI.block = function(elm, options){
        if (elm == null){
            return;
        }

        options = _prepBlockUIOptions(options);
        if (elm == undefined){
            return $.blockUI(options);
        }
        return $(elm).block(options);
    };

    /**
     * Unblock the element.
     *
     * @param elm {?selector|HTMLElement|jQuery=} - the element to clear,
     *                                              or pass null or undefined to clear the entire screen
     * @returns {*}
     */
    UI.unblock = function(elm){
        if (elm == null){
            return;
        }

        if (elm == undefined){
            return $.unblockUI();
        }
        return $(elm).unblock();
    };


    /**
     * Don't show the block until the delay is satisfied.
     *
     * @param delay
     * @param elm {?selector|HTMLElement|jQuery=} - the element to cover,
     *                                              or pass null/undefined to cover the entire screen
     * @param options {?string|object=} - "undefined" just loading no text, "string" text with default option
     *                                          Options reference http://malsup.com/jquery/block/#options
     * @returns {number|undefined}
     */
    UI.delayBlock = function(delay, elm, options){
        if (elm == null){
            return;
        }

        return setTimeout(function(){
                    UI.block(elm, options);
                }, delay);
    };

    /**
     * Unblock the element/screen when UI.delayBlock was used.
     *
     * @param timer {number}
     * @param elm {?selector|HTMLElement|jQuery=} - the element to clear,
     *                                              or pass null or undefined to clear the entire screen
     */
    UI.delayUnblock = function(timer, elm) {
        if (elm == null){
            return;
        }

        clearTimeout(timer);
        UI.unblock(elm);
    };

    /**
     * Get user input (textarea)
     *
     * @param title {string} - The title of the dialog box
     * @param $content {jQuery} - any jquery element with class .txt-prompt-result
     * @param bootstrapDialogOpts - any bootstrap dialog box options
     * @param callback {function} - call back when the user press "OK", function(text, $dialogBox)
     *                                  return true to close dialog box.
     */
    function _prompt(title, $content, bootstrapDialogOpts, callback){
        var opts = $.extend({
            closeByBackdrop: false
        }, bootstrapDialogOpts, {
            title: title,
            message: $content,
            onshown: Fn.combineWithContext(bootstrapDialogOpts, 'onshown', bootstrapDialogOpts, function(){
                $content.find('.txt-prompt-result').focus();
            }),
            buttons: [{
                    label: BootstrapDialog.DEFAULT_TEXTS['CANCEL'],
                    cssClass: 'btn-warn',
                    action: function (dialogRef) {
                        dialogRef.close();
                    }
                },
                {
                    label: BootstrapDialog.DEFAULT_TEXTS['OK'],
                    cssClass: 'btn-primary',
                    action: function (dialogRef) {
                        if (callback.call(dialogRef, $content.find('.txt-prompt-result').val(), dialogRef)){
                            dialogRef.close();
                        }
                    }
                }
            ]
        });

        if (!UI.Patterns.dependencyCheck(BootstrapDialog, gettext('UI.prompt'),
            gettext('This function requires BootstrapDialog'))){
            return;
        }

        BootstrapDialog.show(opts);
    }

    /**
     * Get user input (textbox)
     *
     * @param title {string} - The title of the dialog box
     * @param bootstrapDialogOpts - any bootstrap dialog box options
     * @param callback {function} - call back when the user press "OK", function(text, $dialogBox)
     *                                  return true to close dialog box.
     */
    UI.prompt = function(title, bootstrapDialogOpts, callback){
        var $textbox = $('<div class="form-group"><input type="text" class="txt-prompt-result form-control"></div>');
        _prompt(title, $textbox, bootstrapDialogOpts, callback);
    };

    /**
     * Get user input (textarea)
     *
     * @param title {string} - The title of the dialog box
     * @param bootstrapDialogOpts - any bootstrap dialog box options
     * @param callback {function} - call back when the user press "OK", function(text, $dialogBox)
     *                                  return true to close dialog box.
     */
    UI.promptText = function(title, bootstrapDialogOpts, callback){
        var $textarea = $('<div class="form-group"><textarea class="txt-prompt-result form-control"></textarea></div>');
        $textarea.find('textarea').css('min-height', '270px');
        _prompt(title, $textarea, bootstrapDialogOpts, callback);
    };

}(typeof window !== 'undefined' ? window : this, jQuery, JU.__JU.UI));

/*global jQuery, JU.__JU, Str, Bs, Fn, BootstrapDialog, gettext, Slct, Arr, Typ */

// REQ: jq, jq-form, jq-dialog, bootstrap-ext, type, arr, func, str-standalone, slct


(function (global, $, Patterns, UI, Str, Bs, Fn, Utl, Obj) {
    "use strict";

    // region [ formAutoFocus ]
    /**
     * Auto focus the first textbox with error, if no error select the first textbox available
     *
     * @param rootElement {!selector|jQuery|HTMLElement|id}: the form or any of the form parent
     */
    Patterns.formAutoFocus = function(rootElement) {
        var $rootElement = $(rootElement),
            reqInput = $rootElement.find('.has-error')
                .find('[type="text"], [type="password"], [type="email"], textarea'), input;

        if (reqInput.length){
            reqInput.first().focus().caretToEnd();
        }
        else {
            input = $rootElement.find('input[type="text"], input[type="password"], textarea');
            if (input.length){
                input.first().focus().caretToEnd();
            }
        }
    };
    // endregion

    // region [ submitForm ]

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
        var $frm = $(formSelector),
            defaultAjaxOptions, ajaxFormOpts,
            userBeforeSubmit, userSuccessFunc;

        if (!Patterns.dependencyCheck('ajaxForm', gettext('UI.Patterns.submitForm Error'),
            gettext('This function requires jQuery Form (https://github.com/malsup/form.git).'))){
            return;
        }

        targetSelector = targetSelector || formSelector;

        // region [ setupFormSubmit ]
        /**
         * Setup ajaxForm and record which button was press to submit
         */
        function setupFormSubmit()
        {
            function removeTempHiddenFields()
            {
                // remove the hidden value just encase they press the submit button
                // and the validation failed, after that they press another button
                // without this there will be two value for button press.
                setTimeout(function(){
                    $frm.find('input[type="hidden"][name="submit-via"]').remove();
                }, 2000);
            }

            $frm.ajaxForm(ajaxFormOpts);

            $frm.find('.ajax-reset').click(function(){
                $frm.attr('novalidate', 'novalidate');
                $frm.append(Str.format('<input type="hidden" name="submit-via" value="{0}" />', this.name || this.value));
                if (!$(this).is(':submit')){
                    $frm.submit();
                }
                removeTempHiddenFields();
            });

            $frm.find('[type="submit"]').not('.ajax-reset').click(function(){
                $frm.append(Str.format('<input type="hidden" name="submit-via" value="{0}" />',
                    this.name || this.value));
                removeTempHiddenFields();
            });
        }
        // endregion

        /**
         * Parse the data from the server, if json display/redirect/refresh
         * If html replace the current form with form from server.
         *
         * @param data
         */
        function parseData(data)
        {
            var newAjaxContent, result = Str.parseJson(data, false),
                $result, $localTarget = $(targetSelector), $fileInput;

            // false ie html not a json
            if (result === false) {
                // find only search for descendant, if the element we are looking for
                // is in the first element it would not work.
                $result = $('<div></div>').append(data);

                newAjaxContent = $result.find(targetSelector);

                if (localTarget != undefined){
                    $localTarget = $(localTarget);
                }

                $fileInput = $localTarget.find('input[type="file"]').detach();
                $localTarget.replaceWith(newAjaxContent);

                if ($fileInput.length){
                    // restore file upload if there is an error in the form
                    $localTarget = $(formSelector);
                    Arr.eachJq($fileInput, function($fileFieldWithAttachment){
                        if ($fileFieldWithAttachment.val()) {
                            var fieldName = $fileFieldWithAttachment.attr('name'),
                                $newFileField = $localTarget.find('input[type="file"][name="' + fieldName + '"]');
                            $newFileField.replaceWith($fileFieldWithAttachment);
                        }
                    });
                }

                // reload the frm instance, it could be replaced by the ajax content
                $frm = $(formSelector);
                setupFormSubmit();

                Patterns.formAutoFocus($frm);
                Fn.apply(response, this, [data]);
            }
            else {
                Patterns.parseAjaxCommand(result, targetSelector, context);
                Fn.apply(response, this, [result]);

                if (parentDialog){
                    parentDialog.close();
                }
            }
        }

        userBeforeSubmit = ajaxOptions != undefined && ajaxOptions.hasOwnProperty('beforeSubmit')
                            ? ajaxOptions.beforeSubmit : undefined;
        userSuccessFunc = ajaxOptions != undefined && ajaxOptions.hasOwnProperty('success')
                            ? ajaxOptions.success : undefined;
        defaultAjaxOptions = {
            dataType: 'html',
            error: function(jqXHR, textStatus, errorThrown){
                UI.unblock(targetSelector);
                BootstrapDialog.show({
                    title: gettext('$.ajaxForm() Error'),
                    message: errorThrown || gettext('Error occurred while retrieving the form.'),
                    animate: false
                });
            }
        };

        ajaxFormOpts = $.extend({}, defaultAjaxOptions, ajaxOptions, {
            beforeSubmit: function(){
                Fn.apply(userBeforeSubmit, this, arguments);
                UI.block(targetSelector, blockOptions);
            },
            success: function(data, textStatus, jqXHR){
                UI.unblock(targetSelector);
                parseData(data);
                Fn.apply(userSuccessFunc, this, arguments);
            }
        });

        setupFormSubmit();
    }; // End submitForm
    // endregion

    // region [ ajaxRefresh ]
    /**
     * Refresh a section of the page.
     *
     * @param localTarget {!selector} - the section to refresh
     * @param remoteTarget {?selector=} - if not set use localTarget
     * @param blockTarget {?selector=}
     * @param onAjaxSuccess {?function=} - function(thisArg: context, ajaxContent, ajaxCommand)
     * @param blockOptions {?object=} - blockUI options
     */
    Patterns.ajaxRefresh = function(localTarget, remoteTarget, blockTarget, onAjaxSuccess, blockOptions){
        remoteTarget = remoteTarget || localTarget;
        blockTarget = blockTarget === undefined ? localTarget : blockTarget;

        var ajaxCommand = {
                isAjaxCommand: true,
                message: '',
                displayMethod: '',
                command: 'ajax-refresh',
                status: '',
                options: {
                    localTarget: localTarget,
                    remoteTarget: remoteTarget
                },
                onAjaxSuccess: 'onAjaxSuccess'
            },
            context = {
                onAjaxSuccess: onAjaxSuccess
            };

        if (blockOptions)
        {
            ajaxCommand.options = $.extend({}, blockOptions, ajaxCommand.options);
        }

        Patterns.parseAjaxCommand(ajaxCommand, blockTarget, context);
    };
    // endregion

    // region [ Ajax Get & Post ]
    function remoteFetch(command, url, data, localTarget, remoteTarget, blockTarget, onAjaxSuccess, blockOptions){
        remoteTarget = remoteTarget || localTarget;
        blockTarget = blockTarget === undefined ? localTarget : blockTarget;

        var ajaxCommand = {
                isAjaxCommand: true,
                message: '',
                displayMethod: '',
                command: command,
                status: '',
                options: {
                    remoteUrl: url,
                    data: data,
                    localTarget: localTarget,
                    remoteTarget: remoteTarget
                },
                onAjaxSuccess: 'onAjaxSuccess'
            },
            context = {
                onAjaxSuccess: onAjaxSuccess
            };

        if (blockOptions)
        {
            ajaxCommand.options = $.extend({}, blockOptions, ajaxCommand.options);
        }

        Patterns.parseAjaxCommand(ajaxCommand, blockTarget, context);
    }

    /**
     * Ajax html replacement using content from another page.
     *
     * @param url {!url}
     * @param data {?object}
     * @param localTarget {!selector}
     * @param remoteTarget {?selector}
     * @param blockTarget {?selector}
     * @param onAjaxSuccess {?function=} - function(thisArg: context, ajaxContent, ajaxCommand)
     * @param blockOptions {?object=} - blockUI options
     */
    Patterns.ajaxGet = function(url, data, localTarget, remoteTarget, blockTarget, onAjaxSuccess, blockOptions){
        remoteFetch('ajax-get', url, data, localTarget, remoteTarget, blockTarget, onAjaxSuccess, blockOptions);
    };

    /**
     * Ajax html replacement using content from another page.
     *
     * @param url {!url}
     * @param data {?object}
     * @param localTarget {!selector}
     * @param remoteTarget {?selector}
     * @param blockTarget {?selector}
     * @param onAjaxSuccess {?function=} - function(thisArg: context, ajaxContent, ajaxCommand)
     * @param blockOptions {?object=} - blockUI options
     */
    Patterns.ajaxPost = function(url, data, localTarget, remoteTarget, blockTarget, onAjaxSuccess, blockOptions){
        remoteFetch('ajax-post', url, data, localTarget, remoteTarget, blockTarget, onAjaxSuccess, blockOptions);
    };
    // endregion

    // region [ parseAjaxCommand ]
    /**
     * Parse the ajaxCommand, if message is present display the message.
     *
     * @param ajaxCommand {string|object|{message, method, command, onPreParse, onPostParse, onAjaxSuccess, options, status}}
     * @param blockTarget {?selector|HTMLElement|jQuery=} - the blocking target for block-ui.
     * @param context {?object=} - the object contains the functions specified by onPreParse and onPostParse.
     *                              If not specified the window object is used.
     */
    Patterns.parseAjaxCommand = function(ajaxCommand, blockTarget, context)
    {

        if ($.type(ajaxCommand) === 'string'){
            ajaxCommand = Str.parseJson(ajaxCommand, false);
        }

        if (!Typ.isAjaxCommand(ajaxCommand)){
            return false;
        }

        if (ajaxCommand.command == 'ajax-refresh'){
            ajaxCommand.command = 'ajax-get';
            ajaxCommand.options.remoteUrl = '';
            if (ajaxCommand.options.commonTarget){
                ajaxCommand.options.localTarget = ajaxCommand.options.commonTarget;
                ajaxCommand.options.remoteTarget = ajaxCommand.options.commonTarget;
                delete ajaxCommand.options.commonTarget;
            }
        }

        var defaultBlockUiOptions, blockOptions, bsDialogOpts, defaultBsDialogOpts,
            toastrOpts, defaultToastrOpts, toastrType, toastrTitle,
            displayMethod = ajaxCommand.displayMethod, command = ajaxCommand.command,
            options = ajaxCommand.options, hasSyncAction, canDisplayAsyncTask = false;

        hasSyncAction = $.inArray(ajaxCommand.command, ['refresh', 'redirect']) != -1;

        blockTarget = blockTarget === undefined ? options.localTarget : blockTarget;

        if (Fn.callByName(ajaxCommand.onPreParse, context, options, ajaxCommand) === false)
        {
            Fn.callByName(ajaxCommand.onPostParse, context, options, ajaxCommand);
            return;
        }

        function executeActions()
        {
            var htmlContent = ajaxCommand.options.htmlContent;
            if (htmlContent && ajaxCommand.options.contentSelector) {
                htmlContent = $('<div></div>').append(htmlContent).find(ajaxCommand.options.contentSelector);
            }

            // display the loading screen
            if (command == 'ajax-get' || command == 'ajax-post'){
                UI.block(blockTarget);

                setTimeout(function(){
                    canDisplayAsyncTask = true;
                }, 500);
            }

            if (command == 'refresh') {
                global.location.reload(true);
            }
            else if (command == 'redirect') {
                global.location.href = ajaxCommand.options.redirectUrl;
            }
            else if (command == 'replace-html'){
                $(ajaxCommand.options.localTarget).replaceWith(htmlContent);
            }
            else if (command == 'append-html'){
                $(ajaxCommand.options.localTarget).append(htmlContent);
            }
            else if (!Str.empty(ajaxCommand.onPostParse)){
                Fn.callByName(ajaxCommand.onPostParse, context, options, ajaxCommand);
            }
        }

        function executeAsyncActions() {
            var asyncTaskTimer, ajaxOptions;

            function displayAsyncTask(content, isError) {
                return setInterval(function() {
                    if (canDisplayAsyncTask) {
                        clearInterval(asyncTaskTimer);
                        UI.unblock(blockTarget);

                        var $result = $('<div></div>').append(content),
                            $localTarget;
                        if (!Str.empty(options.remoteTarget)){
                            $result = $result.find(options.remoteTarget);
                        }

                        $localTarget = $(options.localTarget);
                        if (isError) {
                            $localTarget.empty()
                                .append(content);
                        }
                        else {
                            $localTarget.replaceWith($result);

                            if (!Str.empty(ajaxCommand.onAjaxSuccess)){
                                Fn.callByName(ajaxCommand.onAjaxSuccess, context, content, ajaxCommand);
                            }
                        }
                    }
                }, 100);
            }

            if (command == 'ajax-get' || command == 'ajax-post') {
                ajaxOptions = {
                    url: options.remoteUrl || '',
                    method: command == 'ajax-post' ? 'POST' : 'GET',
                    data: options.data || ''
                };

                $.ajax(ajaxOptions)
                    .done(function(data){
                        asyncTaskTimer = displayAsyncTask(data, false);
                    }).fail(function(jqXHR, textStatus, errorThrown){
                        var errorMsg = gettext(errorThrown);
                        if (errorMsg){
                            errorMsg = Str.format('Error: {0}', errorMsg);
                        }
                        else {
                            errorMsg = gettext('Errors occurred while retrieving data from the server ...');
                        }
                        asyncTaskTimer = displayAsyncTask(errorMsg, true);
                    });
            }
        }

        if (displayMethod == 'block-ui')
        {
            // region [ block-ui display ]
            defaultBlockUiOptions = {
                message: ajaxCommand.message || null,
                blockTarget: blockTarget,
                // if redirect then the block will stays for good, so no need to long delay
                // delay cuz in case of fast server, at least this warranty 300ms visibility
                delay: hasSyncAction ? 300 : 2000
            };

            blockOptions = Utl.getPrefixedOptions(options, 'blockUi', defaultBlockUiOptions);
            UI.block(blockOptions.blockTarget, blockOptions);

            executeAsyncActions();

            setTimeout(function () {
                executeActions();

                if (!hasSyncAction) {
                    // if redirect or refresh the block stay on indefinitely
                    UI.unblock(blockOptions.blockTarget);
                }
            }, blockOptions.delay);
            // endregion
        }
        else if (displayMethod == 'bs-dialog')
        {
            defaultBsDialogOpts = {
                title: options.title || gettext('Message'),
                message: ajaxCommand.message,
                animate: false,     // disable transition
                type: ajaxCommand.status == 'error' ? 'type-danger' : 'type-primary',
                buttons: [{
                    label: gettext('OK'),
                    cssClass: 'btn-primary',
                    action: function (dialog) {
                        dialog.close();
                    }
                }],
                onhidden: function(){
                    executeActions();
                }
            };

            executeAsyncActions();
            bsDialogOpts = Utl.getPrefixedOptions(options, 'bsDialog', defaultBsDialogOpts);
            BootstrapDialog.show(bsDialogOpts);
        }
        else if (displayMethod == 'toastr')
        {
            if (!Patterns.dependencyCheck(global.toastr, gettext('UI.Patterns.parseAjaxCommand Toastr Error'),
                    gettext('This function requires toastr plugins (https://github.com/CodeSeven/toastr).'))){
                return;
            }

            defaultToastrOpts = {
                title: undefined,
                type: ajaxCommand.status == 'error' ? 'error' : 'success',
                closeButton: true,
                newestOnTop: true,
                positionClass: 'toast-top-right',
                onHidden: function(){
                }
            };

            executeAsyncActions();
            toastrOpts = Utl.getPrefixedOptions(options, 'toastr', defaultToastrOpts);
            toastrType = Obj.pop(toastrOpts, 'type', 'success');
            toastrTitle = Obj.pop(toastrOpts, 'title', undefined);
            toastr[toastrType](ajaxCommand.message, toastrTitle, toastrOpts);

            executeActions();
        }
        else if (displayMethod == 'alert'){
            executeAsyncActions();
            alert(ajaxCommand.message);
            executeActions();
        }
        else {
            executeAsyncActions();
            executeActions();
        }

        return ajaxCommand;
    }; // End parseAjaxCommand
    // endregion

    // region [ bsDialogAjax ]
    /**
     * Display the dialog and fetch the content using an ajax call.
     *
     * @param title {string} - dialog title
     * @param ajaxOpts {string|object} - url or $.ajax(ajaxOpts)
     * @param dialogOptions {object=} -  BootstrapDialog.show(dialogOptions)
     *                                      title, message, shown and hidden will be overridden/ignore.
     *                                      http://nakupanda.github.io/bootstrap3-dialog/#available-options
     * @param shown {function=} - function(thisArg:dialogRef, data)
     * @param hidden {function=} - function(thisArg:dialogRef)
     * @param context {object=} - the object contains the functions specified by onPreParse and onPostParse.
     *                              If not specified the window object is used.
     * @param dataParser {function=) - parse ajax data to extract the html
     */
    Patterns.bsDialogAjax = function(title, ajaxOpts, dialogOptions, shown, hidden, context, dataParser){
        if (global.BootstrapDialog == undefined){
            alert('This function required Bootstrap Dialog plugin.');
            return;
        }

        var defaultOptions, options;

        defaultOptions = {
            title: title,
            message: gettext('Loading, please wait ... '),
            animate: false,     // disable transition
            onshown: function($dialogRef){
                var uiBlockTmr, $modalDialog = $dialogRef.getModalDialog();
                uiBlockTmr = UI.delayBlock(300, $modalDialog);

                function unblockWaitingScreen() {
                    UI.delayUnblock(uiBlockTmr, $modalDialog);
                }

                $.ajax(ajaxOpts)
                    .done(function(data){
                        var result = Str.parseJson(data, false);

                        // html returned from ajax call
                        if (result === false) {
                            var formHtml = dataParser ? dataParser.call(context, data) : data;
                            $modalDialog.find('.modal-body').empty().append(formHtml);

                            Patterns.formAutoFocus($modalDialog);
                            Fn.apply(shown, $dialogRef, [data]);
                            unblockWaitingScreen();
                        }
                        else {
                            unblockWaitingScreen();
                            $dialogRef.close();
                            UI.Patterns.parseAjaxCommand(result, $modalDialog, context);
                        }
                    }).fail(function(jqXHR, textStatus, errorThrown){
                        unblockWaitingScreen();
                        errorThrown = gettext(errorThrown) || gettext('Error occurred while retrieving the form.');
                        $modalDialog.find('.modal-body').empty().append(
                            Str.format('<span class="error">{0}</span>', errorThrown)
                        );
                    });
            },
            onhidden: function(dialogRef){
                Fn.apply(hidden, dialogRef);
            }
        };

        options = $.extend({}, dialogOptions, defaultOptions);

        return BootstrapDialog.show(options);
    }; // End bsDialogAjax
    // endregion

    // region [ submitAjaxRequest ]
    /**
     * Submit ajax request.
     *
     * @param ajaxOpts {string|object} - url or $.ajax(ajaxOpts)
     * @param blockTarget {?selector|HTMLElement|jQuery=} - use BlockUI to block the target
     *                                                  while waiting for the ajax response.
     * @param onComplete {?function=} - function(thisArg:blockTarget, ajaxData)
     * @param context {?object=} - the object contains the functions specified by onPreParse and onPostParse.
     *                              If not specified the window object is used.
     */
    Patterns.submitAjaxRequest = function(ajaxOpts, blockTarget, onComplete, context){
        var uiBlockTmr = UI.delayBlock(300, blockTarget);

        function unblockWaitingScreen() {
            UI.delayUnblock(uiBlockTmr, blockTarget);
        }

        $.ajax(ajaxOpts)
            .done(function(data){
                var ajaxCommand = Str.parseJson(data, false);
                if (ajaxCommand != false) {
                    unblockWaitingScreen();
                    UI.Patterns.parseAjaxCommand(ajaxCommand, blockTarget, context);

                    if (!ajaxCommand.isAjaxCommand){
                        Fn.apply(onComplete, blockTarget || this, [ajaxCommand]);
                    }
                }
                else {
                    unblockWaitingScreen();
                    Fn.apply(onComplete, blockTarget || this, [data]);
                }
            }).fail(function(jqXHR, textStatus, errorThrown){
                unblockWaitingScreen();

                BootstrapDialog.show({
                    title: gettext('Error'),
                    animate: false,
                    message: gettext(errorThrown) || gettext('Error occurred while submitting ...')
                });
            });
    } ;
    // endregion

    // region [ selectAjaxFilter ]
    var cacheSelectAjaxFilter = {};

    /**
     * Populate target select box based on the value of the src selected values.
     * Server can return json [{value:,  name:}, ] or html contains the select box with same id or name.
     *
     * @param srcSelect {!selector|jQuery|HTMLElement|id=}
     * @param targetSelect {selector|jQuery|HTMLElement|id=}
     * @param ajaxOpts {string|object} - url or $.ajax(ajaxOpts),
     *                                      the data will be overridden with the selected items.
     *                                      data: { selected: [] }
     * @param targetUpdated {function} - function(thisArg:targetElement, $targetElement)
     *                                          called after the target select box is updated.
     * @param noCache {boolean} - do not cache the result
     * @param container {selector} - on() container, if not specified document.body is used.
     */
    Patterns.selectAjaxFilter = function(srcSelect, targetSelect, ajaxOpts, targetUpdated, noCache, container){
        ajaxOpts = $.type(ajaxOpts) === 'string' ? {url: ajaxOpts} : ajaxOpts;

        var $container = $(container || 'body');

        $container.on('change', srcSelect, function(){
            var $srcSelect = $container.find(srcSelect),
                $targetSelect = $container.find(targetSelect),
                selectedValues = Slct.getSelectedValues($srcSelect),
                errorMessage = gettext('Error occurred while retrieving data from the server.'),
                opt = {
                    data: {
                        "src_name": $srcSelect.attr('name'),
                        "target_name": $targetSelect.attr('name')
                    }
                },
                token = $.cookie('csrftoken'), cacheKey;

            if (Typ.isArray(selectedValues)){
                cacheKey = $srcSelect.attr('name') + '_' + Arr.implode(selectedValues, '|');
            }
            else {
                cacheKey = $srcSelect.attr('name') + '_' + selectedValues;
            }

            opt.data[$srcSelect.attr('name')] = selectedValues;

            opt = $.extend({}, ajaxOpts, opt);
            if (token != undefined && opt.data.csrfmiddlewaretoken == undefined && token != undefined){
                opt.data.csrfmiddlewaretoken = token;
            }

            function loadOptions(options) {
                if (Typ.isJquery(options)){
                    $targetSelect.empty().append(options);
                }
                else
                {
                    $targetSelect.empty();
                    Slct.addOptions($targetSelect, options);
                }

                Fn.apply(targetUpdated, $targetSelect.get(0), [$targetSelect]);
            }

            if (!noCache && cacheSelectAjaxFilter.hasOwnProperty(cacheKey))
            {
                loadOptions(cacheSelectAjaxFilter[cacheKey]);
                return;
            }

            $.ajax(opt)
                .done(function(data){
                    var options = Str.parseJson(data, false), targetId, targetName, selector, $options, $data;
                    if (options !== false){
                        cacheSelectAjaxFilter[cacheKey] = options;
                        loadOptions(options);
                    }
                    else {
                        $data = $(data);
                        targetId = $targetSelect.attr('id');
                        if (targetId){
                            selector = 'select#' + targetId;
                            $options = $data.find(selector);
                        }

                        targetName = $targetSelect.attr('name');
                        if (targetName && !$options.length){
                            selector = 'select[name="' + targetName + '"]';
                            $options = $data.find(selector);
                        }

                        if ($options.length){
                            cacheSelectAjaxFilter[cacheKey] = $options.children();
                            loadOptions($options.children());
                        }
                        else {
                            BootstrapDialog.alert(errorMessage);
                        }
                    }
                }).fail(function(jqXHR, textStatus, errorThrown){
                    BootstrapDialog.show({
                        title: errorThrown,
                        animate: false,
                        message: errorMessage
                    });
                });
        });

        if (!Slct.getSelectedValues($(targetSelect))){
            $(srcSelect).change();
        }
    };  // End: selectAjaxFilter
    // endregion

    // region [ clearOnEscape ]
    /**
     * Clear the input when the user pressed Escape.
     *
     * @param inputSelector {!selector} - the input selector
     * @param container {!selector|jQuery|HTMLElement|id=} - if you want to use the live event then specify the
     *                                                          outer container
     */
    Patterns.clearOnEscape = function(inputSelector, container){
        var $container = $(container), $input = $(inputSelector), $target;
        function clearOnEscape(e){
            // on escape
            if (e.which == 27){
                $target = $(e.target);
                $target.prop('value', null).val('').change();
            }
        }

        if (container && $container.length){
            $container.on('keyup', inputSelector, clearOnEscape);
        }
        else {
            $input.on('keyup', clearOnEscape);
        }
    };
    // endregion

    // region [ dependencyCheck ]
    /**
     * Check for plugins/lib dependency.
     *
     * @param testObj - if a string then test for jq $.fn, if false display error message then return false.,
     * @param title - title of the error message
     * @param message - the error message
     * @returns {boolean}
     */
    Patterns.dependencyCheck = function (testObj, title, message) {
        // Preference: dialog, toastr, and then last resort => alert
        var result = false;

        if (testObj){
            if ($.type(testObj) == 'string'){
                result = $.fn.hasOwnProperty(testObj);
            }
            else {
                result = true;
            }
        }

        if (result){
            return true;
        }

        if ($.fn.hasOwnProperty('ajaxForm')) {
            BootstrapDialog.show({
                title: title,
                message: message,
                animate: false
            });
        }
        else if (global.toastr != undefined){
            global.toastr.error(message, title);
        }
        else {
            alert(title + "\n" + message);
        }

        return false;
    };
    // endregion

}(typeof window !== 'undefined' ? window : this, jQuery,
    JU.__JU.UI.Patterns, JU.__JU.UI, JU.__JU.Str, JU.__JU.Bs, JU.__JU.Fn, JU.__JU.Utl, JU.__JU.Obj));
/*global jQuery, JU.__JU, Str, Arr, Fn, Ui, gettext, BootstrapDialog */

// REQ: ui-patterns.js, func.js


(function (global, $, Bs) {
    "use strict";

    /**
     * Use BootstrapDialog to display the confirmation box.
     *
     * @param message {string} - the confirmation question
     * @param buttonClicked {function} - function(thisArg:dialog, result:bool) when "Yes" result is true,
     *                                          "No" or "Close" the result is false
     */
    Bs.confirmYesNo = function(message, buttonClicked){
        function invokeButtonClicked(dialog, result) {
            if (buttonClicked != undefined) {
                Fn.apply(buttonClicked, dialog, [result]);
                buttonClicked = null;
                dialog.close();
            }
        }

        BootstrapDialog.show({
            title: gettext('Confirmation'),
            message: message,
            animate: false,
            buttons: [{
                    label: gettext('(N) No'),
                    hotkey: 78, //N
                    action: function(dialog) {
                        invokeButtonClicked(dialog, false);
                    }
                }, {
                    label: gettext('(Y) Yes'),
                    hotkey: 89, //Y
                    cssClass: 'btn-primary',
                    action: function(dialog) {
                        invokeButtonClicked(dialog, true);
                    }
                }],
            onhide: function(dialog){
                invokeButtonClicked(dialog, false);
            }
        });
    };

}(typeof window !== 'undefined' ? window : this, jQuery, JU.__JU.UI.Bs));


/*global */

// STANDALONE: pure js

(function (global) {
    "use strict";

    if (!global.JU.__JU){
        return;
    }

    var populateGlobals = false, forcePush = false;

    // put the libraries into the private object _ju instead of the global namespace
    // eg. Str becomes _ju.Str
    global._ju = {};

    JU.publish(JU.__JU, populateGlobals, forcePush);
    delete JU.__JU;
    JU.activate(global._ju);

}(typeof window !== 'undefined' ? window : this));