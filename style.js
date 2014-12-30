/*global jQuery */

// STANDALONE

var Stl = {};

(function($, Stl){

    /**
     * Add the style to the head (string -> css style text)
     * @param {String} style
     */
	Stl.add = function(style){
		$('<style type="text/css"> ' + style + ' </style>').appendTo('head');
	};

}(jQuery, Stl));