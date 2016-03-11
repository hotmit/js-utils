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
        s = s.replace(/\{(\d+)(:([^}]+?))?\}/g, function (match, index, format, style) {
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
        s = s.replace(/\{(\d+)\.([a-zA-Z0-9_]+)(:([^}]+?))?\}/g, function (match, index, key, format, style) {
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
