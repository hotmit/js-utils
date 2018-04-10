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
