/*global jQuery, Str, Bs, Fn, BootstrapDialog */

// REQ: str-standalone.js, bootstrap-ext.js, func.js

if (window.UI === undefined)
{
    window.UI = {
        Patterns: {}
    };
}
else if (window.UI.Patterns === undefined)
{
    window.UI.Patterns = {};
}

(function($, Patterns, UI, Str, Bs, Fn){
    /**
     * 1. submit to form.action using ajax
     * 2. if json is return {status, message, action}
     *      process the json
     * 3. if html is return, replace the form with the html provided
     *
     * Requires: jQuery Form (https://github.com/malsup/form.git)
     *
     * @param formSelector {selector} - this selector must work on the content of the ajax data as well
     * @param targetSelector {selector} - which element to extract/update when the data is returned from an ajax call.
     * @param ajaxOptions {object=} - $(form).ajaxForm(ajaxOptions)
     *                                      If undefined the form target is use
     * @param response {function(data)=} - data can be json or return html.
     *
     * Support file upload through the use of https://github.com/malsup/form.git
     * @param blockOptions {object} - blockUI options
     */
    Patterns.submitForm = function(formSelector, targetSelector, ajaxOptions, response, blockOptions){
        var $frm = $(formSelector),
            defaultAjaxOptions, ajaxFormOpts, userSuccessFunc;

        if (!$.fn.hasOwnProperty('ajaxForm')){
            Bs.modalMessage(
                Str.gettext('UI.Patterns.submitForm Error'),
                Str.gettext("This function requires jQuery Form (https://github.com/malsup/form.git)."));
            return;
        }

        targetSelector = targetSelector || formSelector;

        // region [ autoFocus ]
        /**
         * Select the first required textbox/input
         */
        function autoFocus() {
            var reqInput = $frm.find('.has-error').find('[type="text"], [type="password"], [type="email"], textarea'),
                input;
            if (reqInput.length){
                reqInput.first().focus().caretToEnd();
            }
            else {
                input = $frm.find('input[type="text"], input[type="password"], textarea');
                if (input.length){
                    input.first().focus().caretToEnd();
                }
            }
        }
        // endregion

        // region [ setupFormSubmit ]
        /**
         * Setup ajaxForm and record which button was press to submit
         */
        function setupFormSubmit()
        {
            function removeTempHiddenFields()
            {
                // remove the hidden value just encase they press the submit button
                // and the validation failed, after that they press another button
                // without this there will be two value for button press.
                setTimeout(function(){
                    $frm.find('input[type="hidden"][name="submit-via"]').remove();
                }, 2000);
            }

            $frm.ajaxForm(ajaxFormOpts);
            $frm.find('.ajax-reset').click(function(){
                $frm.attr('novalidate', 'novalidate');
                $frm.append(Str.format('<input type="hidden" name="submit-via" value="{0}" />', this.name || this.value));
                if (!$(this).is(':submit')){
                    $frm.submit();
                }
                removeTempHiddenFields();
            });
            $frm.find('[type="submit"]').not('.ajax-reset').click(function(){
                $frm.append(Str.format('<input type="hidden" name="submit-via" value="{0}" />',
                    this.name || this.value));
                removeTempHiddenFields();
            });
        }
        // endregion

        /**
         * Parse the data from the server, if json display/redirect/refresh
         * If html replace the current form with form from server.
         *
         * @param data
         */
        function parseData(data)
        {
            var newAjaxContent, result = Str.parseJson(data, false),
                $result;

            // false ie html not a json
            if (result === false) {
                // $('<div id="outter"><span>Hello</span></div>').find('#outter > *')   // this will return nothing
                // $('<div><div id="outter"><span>Hello</span></div></div>').find('#outter > *')   // this will return div#outtter children
                $result = $('<div></div>').append(data);

                newAjaxContent = $result.find(targetSelector);
                $(targetSelector).replaceWith(newAjaxContent);

                // reload the frm instance, it could be replaced by the ajax content
                $frm = $($frm.selector);
                setupFormSubmit();

                autoFocus();
                Fn.apply(response, this, [data]);
            }
            else {
                Patterns.parseAjaxCommand(result, targetSelector);
                Fn.apply(response, this, [result]);
            }
        }

        userSuccessFunc = ajaxOptions != undefined && ajaxOptions.hasOwnProperty('success') ? ajaxOptions.success : undefined;
        defaultAjaxOptions = {
            dataType: 'html',
            error: function(jqXHR, textStatus, errorThrown){
                UI.unblockElement(targetSelector);
                Bs.modalMessage(Str.gettext('$.ajaxForm() Error'), errorThrown);
            }
        };

        ajaxFormOpts = $.extend({}, defaultAjaxOptions, ajaxOptions, {
            beforeSubmit: function(){
                UI.blockElement(targetSelector, blockOptions);
            },
            success: function(data, textStatus, jqXHR){
                UI.unblockElement(targetSelector);
                parseData(data);
                Fn.apply(userSuccessFunc, this, arguments);
            }
        });

        setupFormSubmit();
    }; // End submitForm

    // region [ parseAjaxCommand ]
    /**
     * Parse the ajaxCommand, if message is present display the message.
     * status:  success|info|warning|danger
     * action:  display, message, [redirect=url|refresh=true]
     *          refresh
     *          forward, url
     *
     * @param ajaxCommand {{status, action, value}}
     * @param blockTarget {selector=} - the block target for "block-ui" command
     */
    Patterns.parseAjaxCommand = function(ajaxCommand, blockTarget)
    {
        if ($.type(ajaxCommand) === 'string'){
            ajaxCommand = Str.parseJson(ajaxCommand, false);
            if (ajaxCommand === false || ajaxCommand.type !== 'ajax-command'){
                return false;
            }
        }

        var action = ajaxCommand.hasOwnProperty('action') && ajaxCommand.action != undefined
            ? ajaxCommand.action.toLowerCase() : '',
            method = ajaxCommand.method || 'bs-dialog',
            defaultBlockUiOptions, blockOptions, dialogOpt;

        function executeActions()
        {
            if (ajaxCommand.refresh) {
                window.location.reload(true);
            }
            else if (!Str.empty(ajaxCommand.redirect)) {
                window.location = ajaxCommand.redirect;
            }
            else if (!Str.empty(ajaxCommand.js_function)){
                Fn.callByName(ajaxCommand.js_function, window, ajaxCommand.data, ajaxCommand);
            }
        }

        if (action == 'display') {
            if (method == 'modal')
            {
                Bs.modalMessage(Str.gettext('Message'), ajaxCommand.message, function () {
                    executeActions();
                });
            }
            else if (method == 'block-ui')
            {
                // region [ block-ui display ]
                defaultBlockUiOptions = {
                    message: ajaxCommand.message || null,
                    overlayCSS: UI.darkOverlayCSS,
                    blockTarget: blockTarget,
                    delay: 400
                };
                blockOptions = $.extend({}, defaultBlockUiOptions, ajaxCommand.data);
                if (blockOptions.blockTarget) {
                    UI.blockElement(blockOptions.blockTarget, blockOptions);
                }
                else {
                    UI.blockScreen(blockOptions);
                }

                setTimeout(function(){
                    executeActions();

                    if (!ajaxCommand.redirect && !ajaxCommand.refresh){
                        if (blockOptions.blockTarget) {
                            UI.unblockElement(blockOptions.blockTarget);
                        }
                        else {
                            UI.unblockScreen();
                        }
                    }
                }, blockOptions.delay);
                // endregion
            }
            else if (method == 'bs-dialog')
            {
                dialogOpt = {
                    title: ajaxCommand.data.title || Str.gettext('Message'),
                    message: ajaxCommand.message,
                    buttons: [{
                        label: Str.gettext('Close'),
                        cssClass: 'btn-primary',
                        action: function (dialog) {
                            dialog.close();
                        }
                    }],
                    onhidden: function(){
                        executeActions();
                    }
                };

                dialogOpt = $.extend({}, dialogOpt, ajaxCommand.data);
                BootstrapDialog.show(dialogOpt);
            }
            else {
                alert(ajaxCommand.message);
            }
        }

        return ajaxCommand;
    };
// endregion

    // $, Patterns,             UI,         Str,        Bs,         Fn
}(jQuery, window.UI.Patterns, window.UI, window.Str, window.UI.Bs, window.Fn));