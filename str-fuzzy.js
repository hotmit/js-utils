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
        breakLine = breakLine === 'undefined' ? breakLine : true;

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

}(typeof window !== 'undefined' ? window : this, jQuery, JU.__JU.Str));
