/*global jQuery, Str */

// REQ: str-standalone.js

if (window.Slct === undefined) {
    window.Slct = {};
}

(function($, Slct){

    /**
     * Get the selected value of a select element.
     *
     * @param selectElement {id|HTMLElement|jQuery} - the select box element
     * @returns {Array} - return [] if no selected options is found.
     */
    Slct.getSelectedValues = function(selectElement){
        var $selected = $(selectElement).find('option:selected'),
            result = [];

        $selected.each(function(index, element){
           result.push(element.value);
        });

        return result;
    };

    // region [ _createOptions ]
    /**
     * Convert json into jQuery options.
     * @param options
     * @returns {jQuery}
     * @private
     */
    function _createOptions(options){
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
    }
    // endregion

    /**
     * Add options to select element.
     *
     * @param selectElement {id|HTMLElement|jQuery} - the select box element
     * @param options {Array} - [ { value: "value", name: "display text", selected: "optional bool" }, ...,
     *                            { optGroup: true, label: "optGroup label", id: "optional id", options: []}}
     */
    Slct.addOptions = function(selectElement, options){
        var $selectElement = $(selectElement),
            $options = _createOptions(options);
        $selectElement.append($options);
    };

    /**
     * Remove the option based on its value.
     *
     * @param selectElement {id|HTMLElement|jQuery} - the select box element
     * @param value {object} - the value of the option you want to remove.
     */
    Slct.removeByValue = function(selectElement, value){
        $(selectElement).find(Str.format('option[value="{0}"]', value)).remove();
    };

    /**
     * Remove option based on the display text.
     *
     * @param selectElement {id|HTMLElement|jQuery} - the select box element
     * @param text {string} - the text of the option you want to remove.
     */
    Slct.removeByText = function(selectElement, text){
        $(selectElement).find('option').each(function(i, option){
            var $option = $(option);
            if ($option.text() == text){
                $option.remove();
            }
        });
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

}(jQuery, window.Slct));