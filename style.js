/*global jQuery, __JU */

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

}(typeof window !== 'undefined' ? window : this, jQuery, __JU.Stl));