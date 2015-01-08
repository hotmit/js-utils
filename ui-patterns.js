/*global jQuery, Str, Bs, Fn */

// REQ: str-standalone.js, bootstrap-ext.js, func.js, Json2.js

var UI = {};

(function($, UI){

    /**
     * 1. submit to form.action using ajax
     * 2. if json is return {status, message, action}
     *      process the json
     * 3. if html is return, replace the form with the html provided
     *
     * @param formSelector {selector} - this selector must work on the content of the ajax data as well
     * @param ajaxOpt {object=} - $.ajax(ajaxOpt). If the form has file upload $(form).ajaxForm(ajaxOpt)
     * @param response {function(data)=} - data can be json or return html
     *
     * Support file upload through the use of https://github.com/malsup/form.git
     */
    UI.submitDjangoForm = function(formSelector, ajaxOpt, response){
        var $frm = $(formSelector),
            hasFileUpload = $frm.find("input[type='file']").length,
            defaultOpt, opt, userSuccessFunc;

        if (hasFileUpload && !$.fn.hasOwnProperty('ajaxForm')){
            Bs.modalMessage(
                Str.gettext('UI.submitDjangoForm Error'),
                Str.gettext("The form contains file upload, you'll need https://github.com/malsup/form.git."));
            return;
        }

        /**
         * Parse the data from the server, if json display/redirect/refresh
         * If html replace the current form with form from server.
         *
         * @param data
         */
        function parseData(data) {
            var newFormContent, result = Str.parseJson(data, false),
                $result;

            // false ie html not a json
            if (result === false) {
                // $('<div id="outter"><span>Hello</span></div>').find('#outter > *')   // this will return nothing
                // $('<div><div id="outter"><span>Hello</span></div></div>').find('#outter > *')   // this will return div#outtter children
                $result = $(data).wrap('<div></div>');
                newFormContent = $result.find($frm.selector + ' > *');
                if (!newFormContent.length) {
                    newFormContent = $result.find('form > *');
                }
                $frm.empty().append(newFormContent);

                Fn.apply(response, this, [data]);
            }
            else {
                UI.parseMessage(result);
                Fn.apply(response, this, [result]);
            }
        }

        if (hasFileUpload)
        {
            userSuccessFunc = ajaxOpt != undefined && ajaxOpt.hasOwnProperty('success') ? ajaxOpt.success : undefined;
            defaultOpt = {
                dataType: 'html',
                error: function(err){
                    Bs.modalMessage(Str.gettext('$.ajaxForm() Error'), err);
                }
            };

            opt = $.extend({}, defaultOpt, ajaxOpt, {
                success: function(data, textStatus, jqXHR){
                    parseData(data);

                    if (userSuccessFunc != undefined){
                        userSuccessFunc.apply(this, arguments);
                    }
                }
            });

            $frm.ajaxForm(opt);
        } // End hasFileUpload
        else {
            $frm.submit(function(){
                if ($.fn.validate !== undefined && $frm.hasOwnProperty('valid'))
                {
                    if (!$frm.isValid()){
                        return false;
                    }
                }

                defaultOpt = {
                    url: this.action,
                    method: this.method,
                    data: $frm.serialize()
                };
                opt = $.extend({}, defaultOpt, ajaxOpt);

                $.ajax(opt)
                    .done(function (data, textStatus, jqXHR) {
                        parseData(data);
                    })
                    .fail(function (jqXHR, textStatus, errorThrown) {
                        Bs.modalMessage(Str.gettext('Error'), errorThrown);
                    });

                return false;
            });
         } // End hasFileUpload else
    }; // End submitDjangoForm

    /**
     * Parse the json, if message is present display the message.
     * status:  success|info|warning|danger
     * action:  display, message, [redirect=url|refresh=true]
     *          refresh
     *          forward, url
     *
     * @param json {{status, action, value}}
     */
    UI.parseMessage = function(json){
        var action = json.hasOwnProperty('action') && json.action != undefined
            ? json.action.toLowerCase() : '';

        if (action == 'display'){
            Bs.modalMessage(Str.gettext('Message'), json.message, function(){
                if (json.refresh || Str.empty(json.redirect)){
                    window.location.reload(true);
                    window.location = window.location.toString();
                }
                else if (!Str.empty(json.redirect)){
                    window.location = json.redirect;
                }
            });
        }
        else if (action == 'refresh'){
            window.location.reload(true);
            window.location = window.location.toString();
        }
        else if (action == 'redirect' && !Str.empty(json.url)){
            window.location = json.url;
        }
    };

}(jQuery, UI));