/*global jQuery */

// STANDALONE

if (typeof window.Stl === 'undefined')
{
    window.Stl = {};
}

(function($, Stl){

    /**
     * Add the style to the head (string -> css style text)
     * @param style {String}
     */
	Stl.add = function(style){
		$('<style type="text/css"> ' + style + ' </style>').appendTo('head');
	};

}(jQuery, window.Stl));