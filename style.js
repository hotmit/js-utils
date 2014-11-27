/*global jQuery */

var $style = {};

(function($, $style){

    /**
     * Add the style to the head (string -> css style text)
     * @param style
     */
	$style.add = function(style){
		$('<style type="text/css"> ' + style + ' </style>').appendTo('head');
	};

}(window.jQuery, $style));