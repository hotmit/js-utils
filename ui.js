/*global jQuery, JU.__JU */

// REQ: jq, block-ui


(function (global, $, UI) {
    "use strict";

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

    function _prepBlockUIOptions(options) {
        var defaultOpts;
        if ($.type(options) === 'string') {
            options = {
                message: options
            };
        }

        defaultOpts = {
            message: null,
            overlayCSS: UI.lightOverlayCSS
        };

        options = $.extend({}, defaultOpts, options);
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

}(typeof window !== 'undefined' ? window : this, jQuery, JU.__JU.UI));
