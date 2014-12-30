/*global jQuery, Str, Arr */

var BsE = {};

(function($, BsE){

    /**
     * Show modal dialog using ajax call
     * @param id - the id of the modal box place holder ie. div.modal
     *                  (if doesn't exist this function will create)
     * @param {object|string} ajax_opts - $.ajax(ajax_opts) OR url
     * @param {?function} fail - ajax.fail
     * @param {object} options - support options: .fade:bool, .size:''|lg|sm
     */
    BsE.modal = function(id, ajax_opts, fail, options){
        var $m = $('#' + id),
            template = Str.multiLines('\n',
                '<div class="modal{0}" id="{1}" tabindex="-1" role="dialog" aria-hidden="true">',
                '  <div class="modal-dialog{2}">',
                '    <div class="modal-content"></div>',
                '  </div>',
                '</div>'
            ), modalDialog,
            defaults = {
                fade: false,
                size: ''
            };

        options = $.extend({}, defaults, options);

        if (!$m.length){
            modalDialog = Str.format(template,
                options.fade ? ' fade' : '',
                id,
                options.size ? ' modal-' + options.size : ''
            );

            $(modalDialog).append('body');
            $m = $($m.selector);
        }

        $.ajax(ajax_opts)
            .done(function(data, textStatus, jqXHR){
                $m.find('.modal-content').html(data);
                $m.modal('show');
            }).fail(function(jqXHR, textStatus, errorThrown){
                if (fail != undefined){
                    fail.apply($m, arguments);
                }
                else {
                    var errorMsg = Str.multiLines('\n',
                        '<div class="modal-header">',
                        '    <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>',
                        '    <h4 class="modal-title">{0}</h4>',
                        '</div>',
                        '<div class="modal-body">{1}</div>',
                        '<div class="modal-footer">',
                        '    <button type="button" class="btn btn-default" data-dismiss="modal">{2}</button>',
                        '</div>)');

                    errorMsg = Str.format(errorMsg,
                        Str.gettext('Error'),
                        Str.gettext(errorThrown),
                        Str.gettext('Close')
                    );

                    $m.find('.modal-content').html(errorMsg);
                }
            });

    };

}(jQuery, BsE));
