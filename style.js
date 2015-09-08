/*global jQuery */

// STANDALONE


(function (global, $) {
	"use strict";

	(function (Stl) {

        /**
         * Add the style to the head (string -> css style text)
         * @param style {String}
         */
        Stl.add = function(style){
            $('<style type="text/css"> ' + style + ' </style>').appendTo('head');
        };

	}(global.Stl));

}(typeof window !== 'undefined' ? window : this, jQuery));