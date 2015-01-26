/*global jQuery, Str */

// REQ: str-standalone.js

if (window.Slct === undefined) {
    window.Slct = {};
}

(function($, Slct){

    /**
     * Get the selected value of a select element.
     *
     * @param selectElement {id|HTMLElement|jQuery} - the select element
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

    /**
     * Add options to select element.
     *
     * @param selectElement {id|HTMLElement|jQuery} - the select element
     * @param options {Array} - [ { value: "value", name: "display text", selected: "optional bool" }, ...}
     */
    Slct.addOptions = function(selectElement, options){
        var $se = $(selectElement);

        $.each(options, function(index, opt){
            var $newOpt = $('<option></option>')
                    .attr('value', opt.value)
                    .text(opt.name);
            if (opt.selected === true){
                $newOpt.attr('selected', 'selected');
            }

            $se.append($newOpt);
        });
    };

    /**
     * Remove the option based on its value.
     *
     * @param selectElement {id|HTMLElement|jQuery} - the select element
     * @param value {object} - the value of the option you want to remove.
     */
    Slct.removeByValue = function(selectElement, value){
        $(selectElement).find(Str.format('option[value="{0}"]', value)).remove();
    };

    /**
     * Remove option based on the display text.
     *
     * @param selectElement {id|HTMLElement|jQuery} - the select element
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

}(jQuery, window.Slct));