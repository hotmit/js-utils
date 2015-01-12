/*global jQuery, Str, Bs, Fn */

// REQ:

if (window.UI === undefined)
{
    window.UI = {};
}

(function($, UI){

    UI.lightOverlayCSS = {
        background: '#eee url(/static/global/images/ajax-loader.gif) no-repeat center',
        backgroundSize: '16px 16px',
        opacity: 0.5
    };

    UI.darkOverlayCSS = {
        background: '#000 url(/static/global/images/ajax-loader.gif) no-repeat center',
        backgroundSize: '16px 16px',
        opacity: 0.6
    };

    function prepBlockUIOptions(options) {
        var defaultOpts;
        if ($.type(options) === 'string') {
            options = {
                message: options
            };
        }

        defaultOpts = {
            message: null,
            overlayCSS: UI.darkOverlayCSS
        };

        options = $.extend({}, defaultOpts, options);
        return options;
    }

    /**
     * Cover the screen with the loading screen.
     * @param options {?string|object=} - "undefined" just loading no text, "string" text with default option
     *                                          Options reference http://malsup.com/jquery/block/#options
     */
    UI.blockScreen = function(options){
        options = prepBlockUIOptions(options);
        return $.blockUI(options);
    };

    /**
     * Unblock loading screen.
     * @returns {*}
     */
    UI.unblockScreen = function(){
        return $.unblockUI();
    };

    /**
     * Overlay the loading screen over the element.
     * @param elm {selector|HTMLElement|jQuery} - the element to cover
     * @param options {?string|object=} - "undefined" just loading no text, "string" text with default option
     *                                          Options reference http://malsup.com/jquery/block/#options
     */
    UI.blockElement = function(elm, options){
        options = prepBlockUIOptions(options);
        return $(elm).block(options);
    };

    /**
     * Unblock the element.
     * @param elm
     * @returns {*}
     */
    UI.unblockElement = function(elm){
        return $(elm).unblock();
    };

}(jQuery, window.UI));
