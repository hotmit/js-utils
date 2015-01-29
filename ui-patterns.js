/*global jQuery, Str, Bs, Fn, BootstrapDialog, gettext, Slct, Arr, Typ */

// REQ: str-standalone.js, bootstrap-ext.js, func.js, slct.js, arr.js, type.js

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
    // region [ submitForm ]
    /**
     * 1. submit to form.action using ajax
     * 2. if json is return {status, message, action}
     *      process the json
     * 3. if html is return, replace the form with the html provided
     *
     * Requires: jQuery Form (https://github.com/malsup/form.git)
     *
     * @param formSelector {selector} - this selector must work on the content of the ajax data as well
     * @param targetSelector {?selector} - which element to extract/update when the data is returned from an ajax call.
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
            BootstrapDialog.show({
                title: gettext('UI.Patterns.submitForm Error'),
                message: gettext("This function requires jQuery Form (https://github.com/malsup/form.git).")
            });
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

        userSuccessFunc = ajaxOptions != undefined && ajaxOptions.hasOwnProperty('success')
                            ? ajaxOptions.success : undefined;
        defaultAjaxOptions = {
            dataType: 'html',
            error: function(jqXHR, textStatus, errorThrown){
                UI.unblock(targetSelector);
                BootstrapDialog.show({
                    title: gettext('$.ajaxForm() Error'),
                    message: errorThrown || gettext('Error occurred while retrieving the form.')
                });
            }
        };

        ajaxFormOpts = $.extend({}, defaultAjaxOptions, ajaxOptions, {
            beforeSubmit: function(){
                UI.block(targetSelector, blockOptions);
            },
            success: function(data, textStatus, jqXHR){
                UI.unblock(targetSelector);
                parseData(data);
                Fn.apply(userSuccessFunc, this, arguments);
            }
        });

        setupFormSubmit();
    }; // End submitForm
    // endregion

    // region [ parseAjaxCommand ]
    /**
     * Parse the ajaxCommand, if message is present display the message.
     *
     * @param ajaxCommand {string|object|{message, method, refresh, redirect, callback, data, status}}
     * @param blockTarget {?selector|HTMLElement|jQuery=} - the blocking target
     */
    Patterns.parseAjaxCommand = function(ajaxCommand, blockTarget)
    {
        if ($.type(ajaxCommand) === 'string'){
            ajaxCommand = Str.parseJson(ajaxCommand, false);
            if (!Typ.isAjaxCommand(ajaxCommand)){
                return false;
            }
        }

        var method = ajaxCommand.method || 'bs-dialog',
            defaultBlockUiOptions, blockOptions, dialogOpt;

        function executeActions()
        {
            if (ajaxCommand.refresh) {
                window.location.reload(true);
            }
            else if (!Str.empty(ajaxCommand.redirect)) {
                window.location = ajaxCommand.redirect;
            }
            else if (!Str.empty(ajaxCommand.callback)){
                Fn.callByName(ajaxCommand.callback, window, ajaxCommand.data, ajaxCommand);
            }
        }

        if (method == 'block-ui')
        {
            // region [ block-ui display ]
            defaultBlockUiOptions = {
                message: ajaxCommand.message || null,
                blockTarget: blockTarget,
                delay: 1000
            };
            blockOptions = $.extend({}, defaultBlockUiOptions, ajaxCommand.data);
            if (blockOptions.blockTarget) {
                UI.block(blockOptions.blockTarget, blockOptions);
            }
            else {
                UI.blockScreen(blockOptions);
            }

            setTimeout(function(){
                executeActions();

                if (!ajaxCommand.redirect && !ajaxCommand.refresh){
                    UI.unblock(blockOptions.blockTarget);
                }
            }, blockOptions.delay);
            // endregion
        }
        else if (method == 'bs-dialog')
        {
            dialogOpt = {
                title: ajaxCommand.data.title || gettext('Message'),
                message: ajaxCommand.message,
                buttons: [{
                    label: gettext('Close'),
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

        return ajaxCommand;
    }; // End parseAjaxCommand
    // endregion

    // region [ bsDialogAjax ]
    /**
     * Display the dialog and fetch the content using an ajax call.
     *
     * @param title {string} - dialog title
     * @param ajaxOpts {string|object} - url or $.ajax(ajaxOpts)
     * @param dialogOptions {object=} -  BootstrapDialog.show(dialogOptions)
     *                                      title, message, shown and hidden will be overridden/ignore.
     * @param shown {function=} - function(thisArg:dialogRef, data)
     * @param hidden {function=} - function(thisArg:dialogRef)
     */
    Patterns.bsDialogAjax = function(title, ajaxOpts, dialogOptions, shown, hidden){
        if (window.BootstrapDialog == undefined){
            BootstrapDialog.show({
                title: gettext('Missing Plugin'),
                message: 'This function required <a href="https://github.com/nakupanda/bootstrap3-dialog"' +
                            'target="_blank">Bootstrap Dialog plugin</a>.'
            });
            return;
        }

        var defaultOptions, options;

        defaultOptions = {
            title: title,
            message: gettext('Loading, please wait ... '),
            onshown: function($dialogRef){
                var uiBlockTmr, $modalDialog = $dialogRef.getModalDialog();
                uiBlockTmr = UI.delayBlock(300, $modalDialog);

                function unblockWaitingScreen() {
                    UI.delayUnblock(uiBlockTmr, $modalDialog);
                }

                $.ajax(ajaxOpts)
                    .done(function(data){
                        var result = Str.parseJson(data, false);
                        // html returned from ajax call
                        if (result === false) {
                            $modalDialog.find('.modal-body').empty().append(data);

                            Fn.apply(shown, $dialogRef, [data]);
                            unblockWaitingScreen();
                        }
                        else {
                            unblockWaitingScreen();
                            $dialogRef.close();
                            UI.Patterns.parseAjaxCommand(result, $modalDialog);
                        }
                    }).fail(function(jqXHR, textStatus, errorThrown){
                        unblockWaitingScreen();
                        errorThrown = gettext(errorThrown) || gettext('Error occurred while retrieving the form.');
                        $modalDialog.find('.modal-body').empty().append(
                            Str.format('<span class="error">{0}</span>', errorThrown)
                        );
                    });
            },
            onhidden: function(dialogRef){
                Fn.apply(hidden, dialogRef);
            }
        };

        options = $.extend({}, dialogOptions, defaultOptions);

        BootstrapDialog.show(options);
    }; // End bsDialogAjax
    // endregion

    // region [ submitAjaxRequest ]
    /**
     * Submit ajax request.
     *
     * @param ajaxOpts {string|object} - url or $.ajax(ajaxOpts)
     * @param blockTarget {?selector|HTMLElement|jQuery=} - use BlockUI to block the target
     *                                                  while waiting for the ajax response.
     * @param onComplete {function} - function(thisArg:blockTarget, ajaxData)
     */
    Patterns.submitAjaxRequest = function(ajaxOpts, blockTarget, onComplete){
        var uiBlockTmr = UI.delayBlock(300, blockTarget);

        function unblockWaitingScreen() {
            UI.delayUnblock(uiBlockTmr, blockTarget);
        }

        $.ajax(ajaxOpts)
            .done(function(data){
                var ajaxCommand = Str.parseJson(data, false);
                if (ajaxCommand != false) {
                    unblockWaitingScreen();
                    UI.Patterns.parseAjaxCommand(ajaxCommand, blockTarget);

                    if (!ajaxCommand.isAjaxCommand){
                        Fn.apply(onComplete, blockTarget || this, [ajaxCommand]);
                    }
                }
                else {
                    unblockWaitingScreen();
                    Fn.apply(onComplete, blockTarget || this, [data]);
                }
            }).fail(function(jqXHR, textStatus, errorThrown){
                unblockWaitingScreen();

                BootstrapDialog.show({
                    title: gettext('Error'),
                    message: gettext(errorThrown || gettext('Error occurred while submitting ...'))
                });
            });
    } ;
    // endregion

    // region [ selectAjaxFilter ]
    var cache_selectAjaxFilter = {};

    /**
     *
     * @param srcSelect
     * @param targetSelect
     * @param ajaxOpts {string|object} - url or $.ajax(ajaxOpts),
     *                                      the data will be overridden with the selected items.
     *                                      data: { selected: [] }
     * @param targetUpdated {function} - function(thisArg:targetElement, $targetElement)
 *                                          called after the target select box is updated.
     * @param noCache {bool} - do not cache the result
     */
    Patterns.selectAjaxFilter = function(srcSelect, targetSelect, ajaxOpts, targetUpdated, noCache){
        var $srcSelect = $(srcSelect),
            $targetSelect = $(targetSelect);

        ajaxOpts = $.type(ajaxOpts) === 'string' ? {url: ajaxOpts} : ajaxOpts;

        $srcSelect.on('change', function(){
            var selectedValues = Slct.getSelectedValues($srcSelect),
                errorMessage = gettext('Error occurred while receiving data from the server.'),
                opt = {
                    data: {
                        src_name: $srcSelect.attr('name'),
                        selected: selectedValues,
                        target_name: $targetSelect.attr('name')
                    }
                },
                token = $.cookie('csrftoken'),
                cacheKey = $srcSelect.attr('name') + '_' + Arr.implode(selectedValues, '|');

            opt = $.extend({}, ajaxOpts, opt);
            if (token != undefined && opt.data.csrfmiddlewaretoken == undefined){
                opt.data.csrfmiddlewaretoken = token;
            }

            function loadOptions(options) {
                $targetSelect.empty();
                Slct.addOptions($targetSelect, options);

                Fn.apply(targetUpdated, $targetSelect.get(0), [$targetSelect]);
            }

            if (!noCache && cache_selectAjaxFilter.hasOwnProperty(cacheKey))
            {
                loadOptions(cache_selectAjaxFilter[cacheKey]);
                return;
            }

            $.ajax(opt)
                .done(function(data){
                    var options = Str.parseJson(data, false);
                    if (options !== false){
                        cache_selectAjaxFilter[cacheKey] = options;
                        loadOptions(options);
                    }
                    else {
                        BootstrapDialog.alert(errorMessage);
                    }

                }).fail(function(jqXHR, textStatus, errorThrown){
                    BootstrapDialog.show({
                        title: errorThrown,
                        message: errorMessage
                    });
                });
        });

        if (!Slct.getSelectedValues($targetSelect).length){
            $srcSelect.change();
        }
    };
    // endregion

    // $, Patterns,             UI,         Str,        Bs,         Fn
}(jQuery, window.UI.Patterns, window.UI, window.Str, window.UI.Bs, window.Fn));