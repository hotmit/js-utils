/*global jQuery, JU.__JU, Str, Arr, Fn, Ui, gettext, BootstrapDialog */

// REQ: ui-patterns.js, func.js


(function (global, $, Bs) {
    "use strict";

    /**
     * Use BootstrapDialog to display the confirmation box.
     *
     * @param message {string} - the confirmation question
     * @param buttonClicked {function} - function(thisArg:dialog, result:bool) when "Yes" result is true,
     *                                          "No" or "Close" the result is false
     */
    Bs.confirmYesNo = function(message, buttonClicked){
        function invokeButtonClicked(dialog, result) {
            if (buttonClicked != undefined) {
                Fn.apply(buttonClicked, dialog, [result]);
                buttonClicked = null;
                dialog.close();
            }
        }

        BootstrapDialog.show({
            title: gettext('Confirmation'),
            message: message,
            animate: false,
            buttons: [{
                    label: gettext('(N) No'),
                    hotkey: 78, //N
                    action: function(dialog) {
                        invokeButtonClicked(dialog, false);
                    }
                }, {
                    label: gettext('(Y) Yes'),
                    hotkey: 89, //Y
                    cssClass: 'btn-primary',
                    action: function(dialog) {
                        invokeButtonClicked(dialog, true);
                    }
                }],
            onhide: function(dialog){
                invokeButtonClicked(dialog, false);
            }
        });
    };

}(typeof window !== 'undefined' ? window : this, jQuery, JU.__JU.UI.Bs));

