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
     * @param formSelector {selector} - this selector must work on the content of the ajax data as well
     * @param targetSelector {selector} - which element to extract/update when the data is returned from an ajax call.
     * @param ajaxOptions {object=} - $.ajax(ajaxOptions). If the form has file upload $(form).ajaxForm(ajaxOptions)
     *                                      If undefined the form target is use
     * @param response {function(data)=} - data can be json or return html.
     *
     * Support file upload through the use of https://github.com/malsup/form.git
     * @param blockOptions {object} - blockUI options
     */
    Patterns.submitForm = function(formSelector, targetSelector, ajaxOptions, response, blockOptions){
        var $frm = $(formSelector),
            $targetParent = $(formSelector).parent(),
            hasFileUpload = $frm.find("input[type='file']").length,
            defaultAjaxOptions, ajaxOpts, ajaxFormOpts, userSuccessFunc;

        if (hasFileUpload && !$.fn.hasOwnProperty('ajaxForm')){
            Bs.modalMessage(
                Str.gettext('UI.Patterns.submitForm Error'),
                Str.gettext("The form contains file upload, you'll need jQuery Form (https://github.com/malsup/form.git)."));
            return;
        }

        targetSelector = targetSelector || formSelector;

        function autoFocus() {
            var reqInput = $frm.find('requiredField input[type="text"], requiredField input[type="password"], requiredField textarea'),
                input;
            if (reqInput.length){
                reqInput.first().focus();
            }
            else {
                input = $frm.find('input[type="text"], input[type="password"], textarea');
                if (input.length){
                    input.first().focus();
                }
            }
        }

        /**
         * Parse the data from the server, if json display/redirect/refresh
         * If html replace the current form with form from server.
         *
         * @param data
         */
        function parseData(data) {
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
                $frm.ajaxForm(ajaxFormOpts);

                autoFocus();

                Fn.apply(response, this, [data]);
            }
            else {
                Patterns.parseMessage(result, targetSelector);
                Fn.apply(response, this, [result]);
            }
        }

        if (hasFileUpload)
        {
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

            $frm.ajaxForm(ajaxFormOpts);
        } // End hasFileUpload
        else {
            $targetParent.on('submit', formSelector, function(){
                if ($.fn.validate !== undefined && $frm.hasOwnProperty('isValid'))
                {
                    if (!$frm.isValid()){
                        return false;
                    }
                }

                UI.blockElement(targetSelector, blockOptions);

                defaultAjaxOptions = {
                    url: this.action,
                    method: this.method,
                    data: $frm.serialize()
                };
                ajaxOpts = $.extend({}, defaultAjaxOptions, ajaxOptions);

                $.ajax(ajaxOpts)
                    .done(function (data, textStatus, jqXHR) {
                        UI.unblockElement(targetSelector);
                        parseData(data);
                    })
                    .fail(function (jqXHR, textStatus, errorThrown) {
                        UI.unblockElement(targetSelector);
                        Bs.modalMessage(Str.gettext('$.ajax() Error'), errorThrown);
                    });

                return false;
            });
         } // End hasFileUpload else
    }; // End submitForm

    /**
     * Parse the jsonCommand, if message is present display the message.
     * status:  success|info|warning|danger
     * action:  display, message, [redirect=url|refresh=true]
     *          refresh
     *          forward, url
     *
     * @param jsonCommand {{status, action, value}}
     * @param blockTarget {selector=} - the block target for "block-ui" command
     */
    Patterns.parseMessage = function(jsonCommand, blockTarget){
        var action = jsonCommand.hasOwnProperty('action') && jsonCommand.action != undefined
            ? jsonCommand.action.toLowerCase() : '',
            method = jsonCommand.method || 'modal',
            defaultBlockUiOptions, blockOptions, dialogOpt;

        function executeDisplayActions(jsonCommand) {
            if (jsonCommand.refresh || Str.empty(jsonCommand.redirect)) {
                window.location.reload(true);
            }
            else if (!Str.empty(jsonCommand.redirect)) {
                window.location = jsonCommand.redirect;
            }
        }

        if (action == 'display') {
            if (method == 'modal') {
                Bs.modalMessage(Str.gettext('Message'), jsonCommand.message, function () {
                    executeDisplayActions(jsonCommand);
                });
            }
            else if (method == 'block-ui')
            {
                // region [ block-ui display ]
                defaultBlockUiOptions = {
                    message: jsonCommand.message || null,
                    overlayCSS: UI.darkOverlayCSS,
                    blockTarget: blockTarget,
                    delay: 400
                };
                blockOptions = $.extend({}, defaultBlockUiOptions, jsonCommand.data);
                if (blockOptions.blockTarget) {
                    UI.blockElement(blockOptions.blockTarget, blockOptions);
                }
                else {
                    UI.blockScreen(blockOptions);
                }

                if (jsonCommand.redirect || jsonCommand.refresh){
                    setTimeout(function(){
                        executeDisplayActions(jsonCommand);
                    }, blockOptions.delay);
                }
                // endregion
            }
            else if (method == 'bs-dialog')
            {
                dialogOpt = {
                    title: jsonCommand.data.title || Str.gettext('Message'),
                    message: jsonCommand.message,
                    buttons: [{
                        label: Str.gettext('Close'),
                        action: function (dialog) {
                            dialog.close();
                        }
                    }],
                    onhidden: function(){
                        executeDisplayActions(jsonCommand);
                    }
                };

                dialogOpt = $.extend({}, dialogOpt, jsonCommand.data);
                BootstrapDialog.show(dialogOpt);
            }
            else {
                alert(jsonCommand.message);
            }
        }
        else if (action == 'refresh'){
            window.location.reload(true);
        }
        else if (action == 'redirect' && !Str.empty(jsonCommand.url)){
            window.location = jsonCommand.url;
        }
    };

    // $, Patterns,             UI,         Str,        Bs,         Fn
}(jQuery, window.UI.Patterns, window.UI, window.Str, window.UI.Bs, window.Fn));