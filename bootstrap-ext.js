/*global jQuery, Str, Arr */

var Bs = {};

(function($, Bs){

    /**
     * Generate the dom for the modal dialog div.modal.
     *
     * @param id {id}- the id of the modal box place holder ie. div.modal
     *                  (if doesn't exist this function will create)
     * @param options {object} - supported options: .fade:bool, .size:string[''|lg|sm], .destroyOnClose:bool
     */
    Bs.createModalDom = function(id, options){
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
                size: '',
                destroyOnClose: true
            };

        options = $.extend({}, defaults, options);

        if (!$m.length){
            modalDialog = Str.format(template,
                options.fade ? ' fade' : '',
                id,
                options.size ? ' modal-' + options.size : ''
            );

            $(modalDialog).appendTo('body');
            $m = $($m.selector);

            if (options.destroyOnClose){
                $m.on('hidden.bs.modal', function(){
                    $(this).removeData('modal');
                    $m.remove();
                });
            }
        }

        return $m;
    };

    /**
     * Show modal dialog using ajax call
     * @param id - the id of the modal box place holder ie. div.modal
     *                  (if doesn't exist this function will create)
     * @param ajax_opts  {object|string}- $.ajax(ajax_opts) OR url
     * @param options {object} - support options: .fade:bool, .size:string[''|lg|sm], .destroyOnClose:bool
     * @param fail {?function} - ajax.fail
     */
    Bs.modalAjax = function (id, ajax_opts, options, fail){
        // Ref: http://getbootstrap.com/javascript/#modals
        var $modal = Bs.createModalDom(id, options);

        $.ajax(ajax_opts)
            .done(function(data, textStatus, jqXHR){
                $modal.find('.modal-content').html(data);
                $modal.modal('show');
            }).fail(function(jqXHR, textStatus, errorThrown){
                if (fail != undefined){
                    fail.apply($modal, arguments);
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

                    $modal.find('.modal-content').html(errorMsg);
                }
            });

    }; // End modal()

    /**
     * Display the message on the bootstrap modal
     *
     * @param title {string}
     * @param message {string}
     * @param closed {function=}
     * @param options {object=}
     */
    Bs.modalMessage = function(title, message, closed, options){
        var $modal = Bs.createModalDom('modal-message-' + new Date().getTime(), options),
            modalBody = Str.multiLines('\n',
                        '<div class="modal-header">',
                        '    <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>',
                        '    <h4 class="modal-title">{0}</h4>',
                        '</div>',
                        '<div class="modal-body">{1}</div>',
                        '<div class="modal-footer">',
                        '    <button type="button" class="btn btn-default" data-dismiss="modal">{2}</button>',
                        '</div>)');

            modalBody = Str.format(modalBody,
                title,
                message,
                Str.gettext('Close')
            );

            $modal.find('.modal-content').html(modalBody);

            $modal.modal('show').on('hidden.bs.modal', function(){
                $(this).removeData('modal');
                $modal.remove();

                if (closed !== undefined){
                    closed.call(this);
                }
            });
    };

}(jQuery, Bs));