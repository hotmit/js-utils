/*global jQuery, JU.__JU, Str */

// REQ: jq, str-standalone.js


(function (global, $, Slct, Str) {
    "use strict";

    /**
     * Get the selected value of a select element.
     *
     * @param selectElement {!selector|jQuery|HTMLElement|id|*} - the select box element
     * @returns {Array|object} - return array if multiple=multiple, else return the single value of the selected option.
     */
    Slct.getSelectedValues = function(selectElement){
        var $selectBox = $(selectElement), $selected = $selectBox.find('option:selected'),
            result = [], $firstOpt;

        if ($selectBox.is('[multiple]')){
            $selected.each(function(index, element){
               result.push(element.value);
            });
            return result;
        }

        $firstOpt = $selected.first();
        if ($firstOpt.length){
            return $firstOpt.val();
        }
        return null;
    };

    // region [ _createOptions ]
    /**
     * Convert json into jQuery options.
     * @param options
     * @returns {jQuery}
     * @private
     */
    function _createOptions(options){
        /**
         * @type {jQuery}
         */
        var $options = $('<select multiple="multiple"></select>');

        $.each(options, function(index, opt){
            var $optGroup, $newOpt;
            if (opt.hasOwnProperty('optGroup')){
                $optGroup = $('<optgroup></optgroup>')
                    .attr('label', opt.label);

                if (opt.id != undefined){
                    $optGroup.attr('id', opt.id);
                }

                if (opt.options != undefined && opt.options.length){
                    $optGroup.append(_createOptions(opt.options));
                }

                $options.append($optGroup);
                return;
            }

            $newOpt = $('<option></option>')
                    .attr('value', opt.value)
                    .text(opt.name);

            if (opt.id != undefined){
                $newOpt.attr('id', opt.id);
            }

            if (opt.selected === true){
                $newOpt.attr('selected', 'selected');
            }

            $options.append($newOpt);
        });

        return $options.children();
    } // End _createOptions
    // endregion

    /**
     * Add options to select element.
     *
     * @param selectElement {!selector|jQuery|HTMLElement|id|*} - the select box element
     * @param options {Array} - [ { value: "value", name: "display text", selected: "optional bool" }, ...,
     *                            { optGroup: true, label: "optGroup label", id: "optional id", options: []}}
     */
    Slct.addOptions = function(selectElement, options){
        var $selectElement = $(selectElement),
            $options = _createOptions(options);
        $selectElement.append($options);
    };

    /**
     * Get options based on value or text.
     *
     * @param selectElement {id|HTMLElement|jQuery} - the select box element
     * @param input - text or option.value
     * @param byValue {boolean}
     * @param caseSensitive {boolean}
     * @returns {boolean}
     * @private
     */
    function _getOption(selectElement, input, byValue, caseSensitive){
        var result = false;
        $(selectElement).find('option').each(function(i, option){
            var $option = $(option);
            if (byValue){
                if (Str.equals($option.val(),  input, caseSensitive)){
                    result = $option;
                    return false;
                }
            }
            else {  // By Text
                if (Str.equals($option.text(),  input, caseSensitive)){
                    result = $option;
                    return false;
                }
            }
        });
        return result;
    }

    /**
     * Get the option by the option value.
     *
     * @param selectElement {id|HTMLElement|jQuery} - the select box element
     * @param value
     * @param caseSensitive
     * @returns {*}
     */
    Slct.getOptionByValue = function(selectElement, value, caseSensitive){
        return _getOption(selectElement, value, true, caseSensitive);
    };

    /**
     * Get the option by the option display text.
     *
     * @param selectElement {id|HTMLElement|jQuery} - the select box element
     * @param text
     * @param caseSensitive
     * @returns {*}
     */
    Slct.getOptionByText = function(selectElement, text, caseSensitive){
        return _getOption(selectElement, text, false, caseSensitive);
    };

    /**
     * Remove the option based on its value.
     *
     * @param selectElement {id|HTMLElement|jQuery} - the select box element
     * @param value {object} - the value of the option you want to remove.
     * @param caseSensitive - case sensitive comparison.
     */
    Slct.removeByValue = function(selectElement, value, caseSensitive){
        var $option = Slct.getOptionByValue(selectElement, value, caseSensitive);
        if ($option){
            $option.remove();
        }
    };

    /**
     * Remove option based on the display text.
     *
     * @param selectElement {id|HTMLElement|jQuery} - the select box element
     * @param text {string} - the text of the option you want to remove.
     * @param caseSensitive - case sensitive comparison.
     */
    Slct.removeByText = function(selectElement, text, caseSensitive){
        var $option = Slct.getOptionByText(selectElement, text, caseSensitive);
        if ($option){
            $option.remove();
        }
    };

    /**
     * Set option as selected based on its value.
     *
     * @param selectElement {id|HTMLElement|jQuery} - the select box element
     * @param value
     * @param caseSensitive
     * @returns {boolean}
     */
    Slct.selectByValue = function(selectElement, value, caseSensitive){
        var $option = Slct.getOptionByValue(selectElement, value, caseSensitive);
        if ($option){
            $option.prop('selected', true);
            return true;
        }
        return false;
    };

    /**
     * Set option as selected based on its display text.
     *
     * @param selectElement {id|HTMLElement|jQuery} - the select box element
     * @param text
     * @param caseSensitive
     * @returns {boolean}
     */
    Slct.selectByText = function(selectElement, text, caseSensitive){
        var $option = Slct.getOptionByText(selectElement, text, caseSensitive);
        if ($option){
            $option.prop('selected', true);
            return true;
        }
        return false;
    };

    /**
     * Select all options.
     *
     * @param selectElement
     */
    Slct.selectAll = function(selectElement){
        $(selectElement).find('option').prop('selected', true);
    };

    /**
     * Clear all selection.
     *
     * @param selectElement
     */
    Slct.selectNone = function(selectElement){
        $(selectElement).find('option').prop('selected', false);
    };

    /**
     * Check to see if the select box has any options.
     *
     * @param selectElement {id|HTMLElement|jQuery} - the select box element
     * @returns {boolean}
     */
    Slct.isEmpty = function(selectElement){
        return !$(selectElement).find('option').length;
    };

    /**
     * Determine if the select box allow multiple select.
     *
     * @param selector {id|HTMLElement|jQuery} - the select box selector
     * @returns {boolean}
     */
    Slct.isMultiple = function(selector){
        return $(selector).is('[multiple]');
    };

    /**
     * Auto save and load last selected index when page reload.
     *
     * @param selector {id|HTMLElement|jQuery} - the select box
     * @param cookieName {string} - the cookie name to store the selected options
     * @param region {id|HTMLElement|jQuery} - restrict to only elements with the specified region, default $('body')
     */
    Slct.autoSaveSelection = function(selector, cookieName, region){
        var $selectBox = $(selector), $region = $(region || 'body'),
            selectedValue = $.cookie(cookieName);

        if (!Str.empty(selectedValue)){
            if (Slct.isMultiple($selectBox)){
                selectedValue = selectedValue.split(',')
            }
            $selectBox.val(selectedValue).change();
        }

        $region.on('change', selector, function(){
            var selectedValue = $(this).val();
            if (selectedValue != null){
                if (Slct.isMultiple($selectBox)) {
                    selectedValue = selectedValue.join(',');
                }
                $.cookie(cookieName, selectedValue);
            }
            else {
                $.removeCookie(cookieName)
            }
        });
    }
}(typeof window !== 'undefined' ? window : this, jQuery, JU.__JU.Slct, JU.__JU.Str));