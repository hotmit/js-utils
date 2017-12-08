/*global jQuery, JU.__JU, Str, Bs, Fn, BootstrapDialog, gettext, Slct, Arr, Typ */

// REQ: jq, jq-form, jq-dialog, bootstrap-ext, type, arr, func, str-standalone, slct


(function (global, $, Patterns, UI, Str, Bs, Fn, Utl, Obj) {
    "use strict";

    // region [ formAutoFocus ]
    /**
     * Auto focus the first textbox with error, if no error select the first textbox available
     *
     * @param rootElement {!selector|jQuery|HTMLElement|id}: the form or any of the form parent
     */
    Patterns.formAutoFocus = function(rootElement) {
        var $rootElement = $(rootElement),
            reqInput = $rootElement.find('.has-error')
                .find('[type="text"], [type="password"], [type="email"], textarea'), input;

        if (reqInput.length){
            reqInput.first().focus().caretToEnd();
        }
        else {
            input = $rootElement.find('input[type="text"], input[type="password"], textarea');
            if (input.length){
                input.first().focus().caretToEnd();
            }
        }
    };
    // endregion

    // region [ submitForm ]

    /**
     * 1. submit to form.action using ajax
     * 2. if json is return {ajaxCommand}
     *      a. process the json
     *      b. if bsDialog is specified, close it
     * 3. if html is return, replace the form with the html provided
     *
     * Requires: jQuery Form (https://github.com/malsup/form.git)
     *  Support file upload through the use of https://github.com/malsup/form.git
     *
     * @param formSelector {selector} - this selector must work on the content of the ajax data as well
     * @param targetSelector {?selector} - which element to extract/update when the data is returned from an ajax call.
     * @param ajaxOptions {?object=} - $(form).ajaxForm(ajaxOptions)
     *                                      If undefined the form target is use
     * @param response {?function(data)=} - This get called when ajax has returned, the data can be json or html content.
     * @param parentDialog {?jQuery=} - the instance of bs dialog. This function will close
     *                                  the dialog once a command is received.
     * @param blockOptions {?object=} - blockUI options
     * @param context {?object=} - the object contains the functions specified by onPreParse and onPostParse.
     *                              If not specified the window object is used.
     * @param localTarget {?selector} - if specify it will replace the specify target with the return html. if not then
     *                                      replace the form as usual.
     */
    Patterns.submitForm = function(formSelector, targetSelector, ajaxOptions,
                                    response, parentDialog, blockOptions, context, localTarget){
        var $frm = $(formSelector),
            defaultAjaxOptions, ajaxFormOpts,
            userBeforeSubmit, userSuccessFunc;

        if (!Patterns.dependencyCheck('ajaxForm', gettext('UI.Patterns.submitForm Error'),
            gettext('This function requires jQuery Form (https://github.com/malsup/form.git).'))){
            return;
        }

        targetSelector = targetSelector || formSelector;

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
                $result, $localTarget = $(targetSelector), $fileInput;

            // false ie html not a json
            if (result === false) {
                // find only search for descendant, if the element we are looking for
                // is in the first element it would not work.
                $result = $('<div></div>').append(data);

                newAjaxContent = $result.find(targetSelector);

                if (localTarget != undefined){
                    $localTarget = $(localTarget);
                }

                $fileInput = $localTarget.find('input[type="file"]').detach();
                $localTarget.replaceWith(newAjaxContent);

                if ($fileInput.length){
                    // restore file upload if there is an error in the form
                    $localTarget = $(formSelector);
                    Arr.eachJq($fileInput, function($fileFieldWithAttachment){
                        if ($fileFieldWithAttachment.val()) {
                            var fieldName = $fileFieldWithAttachment.attr('name'),
                                $newFileField = $localTarget.find('input[type="file"][name="' + fieldName + '"]');
                            $newFileField.replaceWith($fileFieldWithAttachment);
                        }
                    });
                }

                // reload the frm instance, it could be replaced by the ajax content
                $frm = $(formSelector);
                setupFormSubmit();

                Patterns.formAutoFocus($frm);
                Fn.apply(response, this, [data]);
            }
            else {
                Patterns.parseAjaxCommand(result, targetSelector, context);
                Fn.apply(response, this, [result]);

                if (parentDialog){
                    parentDialog.close();
                }
            }
        }

        userBeforeSubmit = ajaxOptions != undefined && ajaxOptions.hasOwnProperty('beforeSubmit')
                            ? ajaxOptions.beforeSubmit : undefined;
        userSuccessFunc = ajaxOptions != undefined && ajaxOptions.hasOwnProperty('success')
                            ? ajaxOptions.success : undefined;
        defaultAjaxOptions = {
            dataType: 'html',
            error: function(jqXHR, textStatus, errorThrown){
                UI.unblock(targetSelector);
                BootstrapDialog.show({
                    title: gettext('$.ajaxForm() Error'),
                    message: errorThrown || gettext('Error occurred while retrieving the form.'),
                    animate: false
                });
            }
        };

        ajaxFormOpts = $.extend({}, defaultAjaxOptions, ajaxOptions, {
            beforeSubmit: function(){
                Fn.apply(userBeforeSubmit, this, arguments);
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

    // region [ ajaxRefresh ]
    /**
     * Refresh a section of the page.
     *
     * @param localTarget {!selector} - the section to refresh
     * @param remoteTarget {?selector=} - if not set use localTarget
     * @param blockTarget {?selector=}
     * @param onAjaxSuccess {?function=} - function(thisArg: context, ajaxContent, ajaxCommand)
     * @param blockOptions {?object=} - blockUI options
     */
    Patterns.ajaxRefresh = function(localTarget, remoteTarget, blockTarget, onAjaxSuccess, blockOptions){
        remoteTarget = remoteTarget || localTarget;
        blockTarget = blockTarget === undefined ? localTarget : blockTarget;

        var ajaxCommand = {
                isAjaxCommand: true,
                message: '',
                displayMethod: '',
                command: 'ajax-refresh',
                status: '',
                options: {
                    localTarget: localTarget,
                    remoteTarget: remoteTarget
                },
                onAjaxSuccess: 'onAjaxSuccess'
            },
            context = {
                onAjaxSuccess: onAjaxSuccess
            };

        if (blockOptions)
        {
            ajaxCommand.options = $.extend({}, blockOptions, ajaxCommand.options);
        }

        Patterns.parseAjaxCommand(ajaxCommand, blockTarget, context);
    };
    // endregion

    // region [ Ajax Get & Post ]
    function remoteFetch(command, url, data, localTarget, remoteTarget, blockTarget, onAjaxSuccess, blockOptions){
        remoteTarget = remoteTarget || localTarget;
        blockTarget = blockTarget === undefined ? localTarget : blockTarget;

        var ajaxCommand = {
                isAjaxCommand: true,
                message: '',
                displayMethod: '',
                command: command,
                status: '',
                options: {
                    remoteUrl: url,
                    data: data,
                    localTarget: localTarget,
                    remoteTarget: remoteTarget
                },
                onAjaxSuccess: 'onAjaxSuccess'
            },
            context = {
                onAjaxSuccess: onAjaxSuccess
            };

        if (blockOptions)
        {
            ajaxCommand.options = $.extend({}, blockOptions, ajaxCommand.options);
        }

        Patterns.parseAjaxCommand(ajaxCommand, blockTarget, context);
    }

    /**
     * Ajax html replacement using content from another page.
     *
     * @param url {!url}
     * @param data {?object}
     * @param localTarget {!selector}
     * @param remoteTarget {?selector}
     * @param blockTarget {?selector}
     * @param onAjaxSuccess {?function=} - function(thisArg: context, ajaxContent, ajaxCommand)
     * @param blockOptions {?object=} - blockUI options
     */
    Patterns.ajaxGet = function(url, data, localTarget, remoteTarget, blockTarget, onAjaxSuccess, blockOptions){
        remoteFetch('ajax-get', url, data, localTarget, remoteTarget, blockTarget, onAjaxSuccess, blockOptions);
    };

    /**
     * Ajax html replacement using content from another page.
     *
     * @param url {!url}
     * @param data {?object}
     * @param localTarget {!selector}
     * @param remoteTarget {?selector}
     * @param blockTarget {?selector}
     * @param onAjaxSuccess {?function=} - function(thisArg: context, ajaxContent, ajaxCommand)
     * @param blockOptions {?object=} - blockUI options
     */
    Patterns.ajaxPost = function(url, data, localTarget, remoteTarget, blockTarget, onAjaxSuccess, blockOptions){
        remoteFetch('ajax-post', url, data, localTarget, remoteTarget, blockTarget, onAjaxSuccess, blockOptions);
    };
    // endregion

    // region [ parseAjaxCommand ]
    /**
     * Parse the ajaxCommand, if message is present display the message.
     *
     * @param ajaxCommand {string|object|{message, method, command, onPreParse, onPostParse, onAjaxSuccess, options, status}}
     * @param blockTarget {?selector|HTMLElement|jQuery=} - the blocking target for block-ui.
     * @param context {?object=} - the object contains the functions specified by onPreParse and onPostParse.
     *                              If not specified the window object is used.
     */
    Patterns.parseAjaxCommand = function(ajaxCommand, blockTarget, context)
    {

        if ($.type(ajaxCommand) === 'string'){
            ajaxCommand = Str.parseJson(ajaxCommand, false);
        }

        if (!Typ.isAjaxCommand(ajaxCommand)){
            return false;
        }

        if (ajaxCommand.command == 'ajax-refresh'){
            ajaxCommand.command = 'ajax-get';
            ajaxCommand.options.remoteUrl = '';
            if (ajaxCommand.options.commonTarget){
                ajaxCommand.options.localTarget = ajaxCommand.options.commonTarget;
                ajaxCommand.options.remoteTarget = ajaxCommand.options.commonTarget;
                delete ajaxCommand.options.commonTarget;
            }
        }

        var defaultBlockUiOptions, blockOptions, bsDialogOpts, defaultBsDialogOpts,
            toastrOpts, defaultToastrOpts, toastrType, toastrTitle,
            displayMethod = ajaxCommand.displayMethod, command = ajaxCommand.command,
            options = ajaxCommand.options, hasSyncAction, canDisplayAsyncTask = false;

        hasSyncAction = $.inArray(ajaxCommand.command, ['refresh', 'redirect']) != -1;

        blockTarget = blockTarget === undefined ? options.localTarget : blockTarget;

        if (Fn.callByName(ajaxCommand.onPreParse, context, options, ajaxCommand) === false)
        {
            Fn.callByName(ajaxCommand.onPostParse, context, options, ajaxCommand);
            return;
        }

        function executeActions()
        {
            var htmlContent = ajaxCommand.options.htmlContent;
            if (htmlContent && ajaxCommand.options.contentSelector) {
                htmlContent = $('<div></div>').append(htmlContent).find(ajaxCommand.options.contentSelector);
            }

            // display the loading screen
            if (command == 'ajax-get' || command == 'ajax-post'){
                UI.block(blockTarget);

                setTimeout(function(){
                    canDisplayAsyncTask = true;
                }, 500);
            }

            if (command == 'refresh') {
                global.location.reload(true);
            }
            else if (command == 'redirect') {
                global.location = ajaxCommand.options.redirectUrl;
            }
            else if (command == 'replace-html'){
                $(ajaxCommand.options.localTarget).replaceWith(htmlContent);
            }
            else if (command == 'append-html'){
                $(ajaxCommand.options.localTarget).append(htmlContent);
            }
            else if (!Str.empty(ajaxCommand.onPostParse)){
                Fn.callByName(ajaxCommand.onPostParse, context, options, ajaxCommand);
            }
        }

        function executeAsyncActions() {
            var asyncTaskTimer, ajaxOptions;

            function displayAsyncTask(content, isError) {
                return setInterval(function() {
                    if (canDisplayAsyncTask) {
                        clearInterval(asyncTaskTimer);
                        UI.unblock(blockTarget);

                        var $result = $('<div></div>').append(content),
                            $localTarget;
                        if (!Str.empty(options.remoteTarget)){
                            $result = $result.find(options.remoteTarget);
                        }

                        $localTarget = $(options.localTarget);
                        if (isError) {
                            $localTarget.empty()
                                .append(content);
                        }
                        else {
                            $localTarget.replaceWith($result);

                            if (!Str.empty(ajaxCommand.onAjaxSuccess)){
                                Fn.callByName(ajaxCommand.onAjaxSuccess, context, content, ajaxCommand);
                            }
                        }
                    }
                }, 100);
            }

            if (command == 'ajax-get' || command == 'ajax-post') {
                ajaxOptions = {
                    url: options.remoteUrl || '',
                    method: command == 'ajax-post' ? 'POST' : 'GET',
                    data: options.data || ''
                };

                $.ajax(ajaxOptions)
                    .done(function(data){
                        asyncTaskTimer = displayAsyncTask(data, false);
                    }).fail(function(jqXHR, textStatus, errorThrown){
                        var errorMsg = gettext(errorThrown);
                        if (errorMsg){
                            errorMsg = Str.format('Error: {0}', errorMsg);
                        }
                        else {
                            errorMsg = gettext('Errors occurred while retrieving data from the server ...');
                        }
                        asyncTaskTimer = displayAsyncTask(errorMsg, true);
                    });
            }
        }

        if (displayMethod == 'block-ui')
        {
            // region [ block-ui display ]
            defaultBlockUiOptions = {
                message: ajaxCommand.message || null,
                blockTarget: blockTarget,
                // if redirect then the block will stays for good, so no need to long delay
                // delay cuz in case of fast server, at least this warranty 300ms visibility
                delay: hasSyncAction ? 300 : 2000
            };

            blockOptions = Utl.getPrefixedOptions(options, 'blockUi', defaultBlockUiOptions);
            UI.block(blockOptions.blockTarget, blockOptions);

            executeAsyncActions();

            setTimeout(function () {
                executeActions();

                if (!hasSyncAction) {
                    // if redirect or refresh the block stay on indefinitely
                    UI.unblock(blockOptions.blockTarget);
                }
            }, blockOptions.delay);
            // endregion
        }
        else if (displayMethod == 'bs-dialog')
        {
            defaultBsDialogOpts = {
                title: options.title || gettext('Message'),
                message: ajaxCommand.message,
                animate: false,     // disable transition
                type: ajaxCommand.status == 'error' ? 'type-danger' : 'type-primary',
                buttons: [{
                    label: gettext('OK'),
                    cssClass: 'btn-primary',
                    action: function (dialog) {
                        dialog.close();
                    }
                }],
                onhidden: function(){
                    executeActions();
                }
            };

            executeAsyncActions();
            bsDialogOpts = Utl.getPrefixedOptions(options, 'bsDialog', defaultBsDialogOpts);
            BootstrapDialog.show(bsDialogOpts);
        }
        else if (displayMethod == 'toastr')
        {
            if (!Patterns.dependencyCheck(global.toastr, gettext('UI.Patterns.parseAjaxCommand Toastr Error'),
                    gettext('This function requires toastr plugins (https://github.com/CodeSeven/toastr).'))){
                return;
            }

            defaultToastrOpts = {
                title: undefined,
                type: ajaxCommand.status == 'error' ? 'error' : 'success',
                closeButton: true,
                newestOnTop: true,
                positionClass: 'toast-top-right',
                onHidden: function(){
                }
            };

            executeAsyncActions();
            toastrOpts = Utl.getPrefixedOptions(options, 'toastr', defaultToastrOpts);
            toastrType = Obj.pop(toastrOpts, 'type', 'success');
            toastrTitle = Obj.pop(toastrOpts, 'title', undefined);
            toastr[toastrType](ajaxCommand.message, toastrTitle, toastrOpts);

            executeActions();
        }
        else if (displayMethod == 'alert'){
            executeAsyncActions();
            alert(ajaxCommand.message);
            executeActions();
        }
        else {
            executeAsyncActions();
            executeActions();
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
     *                                      http://nakupanda.github.io/bootstrap3-dialog/#available-options
     * @param shown {function=} - function(thisArg:dialogRef, data)
     * @param hidden {function=} - function(thisArg:dialogRef)
     * @param context {object=} - the object contains the functions specified by onPreParse and onPostParse.
     *                              If not specified the window object is used.
     */
    Patterns.bsDialogAjax = function(title, ajaxOpts, dialogOptions, shown, hidden, context){
        if (global.BootstrapDialog == undefined){
            alert('This function required Bootstrap Dialog plugin.');
            return;
        }

        var defaultOptions, options;

        defaultOptions = {
            title: title,
            message: gettext('Loading, please wait ... '),
            animate: false,     // disable transition
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

                            Patterns.formAutoFocus($modalDialog);
                            Fn.apply(shown, $dialogRef, [data]);
                            unblockWaitingScreen();
                        }
                        else {
                            unblockWaitingScreen();
                            $dialogRef.close();
                            UI.Patterns.parseAjaxCommand(result, $modalDialog, context);
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

        return BootstrapDialog.show(options);
    }; // End bsDialogAjax
    // endregion

    // region [ submitAjaxRequest ]
    /**
     * Submit ajax request.
     *
     * @param ajaxOpts {string|object} - url or $.ajax(ajaxOpts)
     * @param blockTarget {?selector|HTMLElement|jQuery=} - use BlockUI to block the target
     *                                                  while waiting for the ajax response.
     * @param onComplete {?function=} - function(thisArg:blockTarget, ajaxData)
     * @param context {?object=} - the object contains the functions specified by onPreParse and onPostParse.
     *                              If not specified the window object is used.
     */
    Patterns.submitAjaxRequest = function(ajaxOpts, blockTarget, onComplete, context){
        var uiBlockTmr = UI.delayBlock(300, blockTarget);

        function unblockWaitingScreen() {
            UI.delayUnblock(uiBlockTmr, blockTarget);
        }

        $.ajax(ajaxOpts)
            .done(function(data){
                var ajaxCommand = Str.parseJson(data, false);
                if (ajaxCommand != false) {
                    unblockWaitingScreen();
                    UI.Patterns.parseAjaxCommand(ajaxCommand, blockTarget, context);

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
                    animate: false,
                    message: gettext(errorThrown) || gettext('Error occurred while submitting ...')
                });
            });
    } ;
    // endregion

    // region [ selectAjaxFilter ]
    var cache_selectAjaxFilter = {};

    /**
     * Populate target select box based on the value of the src selected values.
     * Server can return json [{value:,  name:}, ] or html contains the select box with same id or name.
     *
     * @param srcSelect {!selector|jQuery|HTMLElement|id=}
     * @param targetSelect {selector|jQuery|HTMLElement|id=}
     * @param ajaxOpts {string|object} - url or $.ajax(ajaxOpts),
     *                                      the data will be overridden with the selected items.
     *                                      data: { selected: [] }
     * @param targetUpdated {function} - function(thisArg:targetElement, $targetElement)
     *                                          called after the target select box is updated.
     * @param noCache {boolean} - do not cache the result
     * @param container {selector} - on() container, if not specified document.body is used.
     */
    Patterns.selectAjaxFilter = function(srcSelect, targetSelect, ajaxOpts, targetUpdated, noCache, container){
        ajaxOpts = $.type(ajaxOpts) === 'string' ? {url: ajaxOpts} : ajaxOpts;

        var $container = $(container || 'body');

        $container.on('change', srcSelect, function(){
            var $srcSelect = $container.find(srcSelect),
                $targetSelect = $container.find(targetSelect),
                selectedValues = Slct.getSelectedValues($srcSelect),
                errorMessage = gettext('Error occurred while retrieving data from the server.'),
                opt = {
                    data: {
                        src_name: $srcSelect.attr('name'),
                        target_name: $targetSelect.attr('name')
                    }
                },
                token = $.cookie('csrftoken'), cacheKey;

            if (Typ.isArray(selectedValues)){
                cacheKey = $srcSelect.attr('name') + '_' + Arr.implode(selectedValues, '|');
            }
            else {
                cacheKey = $srcSelect.attr('name') + '_' + selectedValues;
            }

            opt.data[$srcSelect.attr('name')] = selectedValues;

            opt = $.extend({}, ajaxOpts, opt);
            if (token != undefined && opt.data.csrfmiddlewaretoken == undefined && token != undefined){
                opt.data.csrfmiddlewaretoken = token;
            }

            function loadOptions(options) {
                if (Typ.isJquery(options)){
                    $targetSelect.empty().append(options);
                }
                else
                {
                    $targetSelect.empty();
                    Slct.addOptions($targetSelect, options);
                }

                Fn.apply(targetUpdated, $targetSelect.get(0), [$targetSelect]);
            }

            if (!noCache && cache_selectAjaxFilter.hasOwnProperty(cacheKey))
            {
                loadOptions(cache_selectAjaxFilter[cacheKey]);
                return;
            }

            $.ajax(opt)
                .done(function(data){
                    var options = Str.parseJson(data, false), targetId, targetName, selector, $options, $data;
                    if (options !== false){
                        cache_selectAjaxFilter[cacheKey] = options;
                        loadOptions(options);
                    }
                    else {
                        $data = $(data);
                        targetId = $targetSelect.attr('id');
                        if (targetId){
                            selector = 'select#' + targetId;
                            $options = $data.find(selector);
                        }

                        targetName = $targetSelect.attr('name');
                        if (targetName && !$options.length){
                            selector = 'select[name="' + targetName + '"]';
                            $options = $data.find(selector);
                        }

                        if ($options.length){
                            cache_selectAjaxFilter[cacheKey] = $options.children();
                            loadOptions($options.children());
                        }
                        else {
                            BootstrapDialog.alert(errorMessage);
                        }
                    }
                }).fail(function(jqXHR, textStatus, errorThrown){
                    BootstrapDialog.show({
                        title: errorThrown,
                        animate: false,
                        message: errorMessage
                    });
                });
        });

        if (!Slct.getSelectedValues($(targetSelect))){
            $(srcSelect).change();
        }
    };  // End: selectAjaxFilter
    // endregion

    // region [ clearOnEscape ]
    /**
     * Clear the input when the user pressed Escape.
     *
     * @param inputSelector {!selector} - the input selector
     * @param container {!selector|jQuery|HTMLElement|id=} - if you want to use the live event then specify the
     *                                                          outer container
     */
    Patterns.clearOnEscape = function(inputSelector, container){
        var $container = $(container), $input = $(inputSelector), $target;
        function clearOnEscape(e){
            // on escape
            if (e.which == 27){
                $target = $(e.target);
                $target.prop('value', null).val('').change();
            }
        }

        if (container && $container.length){
            $container.on('keyup', inputSelector, clearOnEscape);
        }
        else {
            $input.on('keyup', clearOnEscape);
        }
    };
    // endregion

    // region [ dependencyCheck ]
    /**
     * Check for plugins/lib dependency.
     *
     * @param testObj - if a string then test for jq $.fn, if false display error message then return false.,
     * @param title - title of the error message
     * @param message - the error message
     * @returns {boolean}
     */
    Patterns.dependencyCheck = function (testObj, title, message) {
        // Preference: dialog, toastr, and then last resort => alert
        var result = false;

        if (testObj){
            if ($.type(testObj) == 'string'){
                result = $.fn.hasOwnProperty(testObj);
            }
            else {
                result = true;
            }
        }

        if (result){
            return true;
        }

        if ($.fn.hasOwnProperty('ajaxForm')) {
            BootstrapDialog.show({
                title: title,
                message: message,
                animate: false
            });
        }
        else if (global.toastr != undefined){
            global.toastr.error(message, title);
        }
        else {
            alert(title + "\n" + message);
        }

        return false;
    };
    // endregion

}(typeof window !== 'undefined' ? window : this, jQuery,
    JU.__JU.UI.Patterns, JU.__JU.UI, JU.__JU.Str, JU.__JU.Bs, JU.__JU.Fn, JU.__JU.Utl, JU.__JU.Obj));