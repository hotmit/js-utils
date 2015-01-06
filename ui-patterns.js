/*global jQuery, Str, Bs */

var UI = {};

(function($, UI){

    /**
     * 1. submit to form.action using ajax
     * 2. if json is return {status, message, action}
     *      process the json
     * 3. if html is return, replace the form with the html provided
     *
     * @param form {selector} - this selector must work on the content of the ajax data as well
     * @param ajaxOpt {object=} - $.ajax(ajaxOpt). If the form has file upload $(form).ajaxForm(ajaxOpt)
     *
     * Support file upload through the use of https://github.com/malsup/form.git
     */
    UI.submitDjangoForm = function(form, ajaxOpt){
        var $frm = $(form),
            hasFileUpload = $frm.find("input[type='file']").length;

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
                $result = $(data);
                newFormContent = $result.find($frm.selector + ' > *');
                if (!newFormContent.length) {
                    newFormContent = $result.find('form > *');
                }
                $frm.empty().append(newFormContent);
            }
            else {
                UI.parseMessage(result);
            }
        }

        $frm.submit(function(){
            var defaultOpt, opt, userSuccessFunc;

            if ($.fn.validate !== undefined && $frm.hasOwnProperty('valid'))
            {
                if (!$frm.isValid()){
                    return false;
                }
            }

            if (hasFileUpload)
            {
                userSuccessFunc = ajaxOpt.hasOwnProperty('success') ? ajaxOpt.success : undefined;
                defaultOpt = {
                    url: this.action,
                    dataType: 'html',
                    type: this.method,
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
            } // End hasFileUpload else

            return false;
        });

    };

    /**
     * Parse the json, if message is present display the message.
     * status:  success|info|warning|danger
     * action:  display, message
     *          refresh
     *          forward, url
     *
     * @param json {{status, action, value}}
     */
    UI.parseMessage = function(json){
        var action = json.action ? json.action.toLowerCase() : 'display';

        if (action == 'display'){
            Bs.modalMessage(Str.gettext('Message'), json.message);
        }
        else if (action == 'refresh'){
            window.location.reload(true);
        }
        else if (action == 'forward'){
            window.location = json.url;
        }

    };

}(jQuery, UI));