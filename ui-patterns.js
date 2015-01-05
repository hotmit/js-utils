/*global jQuery, Str, Bs */

var UI = {};

(function($, UI){

    /**
     * 1. submit to form.action using ajax
     * 2. if json is return {status, message, action}
     *      process the json
     * 3. if html is return, replace the form with the html provided
     *
     * @param form {selector|jQuery}
     * @param ajaxOpt {object=} - $.ajax(ajaxOpt)
     * @param done {function=} - $.ajax.done()
     * @param fail {function=} - $.ajax.fail()
     * @param always {function=} - $.ajax.always()
     */
    UI.submitDjangoForm = function(form, ajaxOpt, done, fail, always){
        var $frm = $(form);

        $frm.submit(function(){
            if ($.fn.validate !== undefined && $frm.hasOwnProperty('valid'))
            {
                if (!$frm.isValid()){
                    return;
                }
            }

            var defaultOpt = {
                    url: this.action,
                    method: this.method,
                    data: $frm.serialize()
                },
                opt = $.extend({}, defaultOpt, ajaxOpt);

            $.ajax(opt)
                .done(function(data, textStatus, jqXHR){
                    var newFormContent, result = Str.parseJson(data, false);
                    if (result === false){
                        newFormContent = $(result).find($frm.selector + ' > *');
                        $frm.empty().append(newFormContent);
                    }
                    else {
                        UI.parseMessage(result);
                    }

                    done.apply(this, arguments);
                })
                .fail(function(jqXHR, textStatus, errorThrown){
                    fail.apply(this, arguments);
                })
                .always(function(){     // data|jqXHR, textStatus, jqXHR|errorThrown
                    always.apply(this, arguments);
                });

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