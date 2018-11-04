(function($){
    $.fn.otysselect = function(options){
        var _this = this;
        var _$this = $(_this);

        var output = { settings : {} }; // Return object for plugin

        // Extend default settings with options
        output.settings = $.extend({
             onInit: null, // Called on initialize (expects function)
             search: true, // Enable search
        });

        var _execute = function(select, callback){
            var $selectElement = $(select);
            var $selectElemented = ($selectElement.find('option[selected]').length) ? $selectElement.find('option[selected]') : $selectElement.find('option').first();
            var multiple = ($selectElement.attr('multiple')) ? true : false;
            var placeholder = $selectElement.parents('label').text();
            console.log(placeholder);

            // Wrap current select
            $selectElement.wrap('<div class="otysselect" multiple="'+ multiple +'"></div>');
            
            // Generate HTML
            var $html = '';
            $html += '<div class="os-select">';
                $html += '<div class="os-selected" data-value="'+ $selectElemented.attr('value') +'"><div class="os-value"><span class="os-placeholder">'+ placeholder +'</span></div></div>';

                $html += '<div class="os-collapse">';
                    if(output.settings.search){
                        $html += '<div class="os-search"><input type="text" class="os-searchfield" /></div>';
                    }

                    $html += '<div class="os-options">';
                        $selectElement.find('option').each(function(i, e){
                            $html += '<div class="os-option" data-search="'+ $(this).text().toLowerCase() +'" data-value="'+ $(this).attr('value') +'">'+ $(this).text() +'</div>';
                        });
                    $html += '</div>'; /*close os-options*/
                $html += '</div>'; /*close os-collapse*/
            $html += '</div>'; /*close os-select */

            $selectElement.parent().append($html);

            // Run _execute callback if set
            if ( $.isFunction( callback ) ) {
                callback( result );
            }
        };

        var _close = function($otysselect){
            $otysselect.removeClass('open');
        };

        var __initialize = function($selectElement){
            var data = _execute($selectElement);

            if ( $.isFunction( output.settings.onInit ) ) {
                output.settings.onInit(data);
            }

            return data;
        };

        this.each(function(instanceNumber, selectElement){
            /*
            *   Run first instance & Generate HTML
            */
            __initialize(selectElement);

            /*
            *   Initialize vars for this instance
            */
            var $otysselect = $(selectElement).parent();
            var multiselect = ($(selectElement).attr('multiple')) ? true : false;

            /*
                Bind events
            */
            /* Opening select */
            $otysselect.on('click', '.os-selected', function(e){
                _close($('.otysselect').not($otysselect));

                $otysselect.toggleClass('open');
                $otysselect.find('.os-search input').focus();
            });

            /* 
            * Choosing a option 
            */
            if(multiselect){
                $otysselect.on('click', '.os-option', function(e){
                    var value = $(this).attr('data-value');
                    var label = $(this).attr('data-label');

                    // Select selected option
                    var $option = $otysselect.find('select option[value="'+ value +'"]');

                    if($option.attr('selected')){
                        $option.removeAttr('selected');
                        $otysselect.find('.os-value span[data-value="'+ value +'"]').remove();
                    }else{
                        $option.attr('selected', 'selected');

                        // Display selected options
                        $otysselect.find('.os-value').append('<span class="os-label" data-label="'+ label +'" data-value="'+ value +'">'+ $(this).text() +'<span class="remove"></span></span>');
                    }


                    _close($otysselect);
                });
            }else{
                $otysselect.on('click', '.os-option', function(e){
                    var value = $(this).attr('data-value');
                    var text = $(this).text();

                    $otysselect.find('.os-option').removeAttr('selected'); // Remove visible option
                    $otysselect.find('select option').removeAttr('selected'); // Remove actual select option
                    $otysselect.find('select option[value="'+ value +'"]').attr('selected', 'selected');

                    $otysselect.find('.os-value').attr('data-value', value).text(text);

                    _close($otysselect);
                });
            }

            /* 
            * Delete a option when clicking selected item
            */
            $otysselect.on('click', '.os-label', function(e){
                var value = $(this).attr('data-value');
                $otysselect.find('select option[value="'+ value +'"]').removeAttr('selected');
                $(this).remove();
            });

            $otysselect.on('keyup', '.os-search input', function(){
                console.log($(this).val());

                $otysselect.find('.os-option').show();

                if($(this).val().length){
                    $otysselect.find('.os-option:not([data-search*="'+ $(this).val().toLowerCase() +'"])').hide();
                }
            });

            return __initialize();
        });

        $(document).on('mouseup', function(e){
            var $otysselect = $('.otysselect');

            // if the target of the click isn't the container nor a descendant of the container
            if (!$otysselect.is(e.target) && $otysselect.has(e.target).length === 0){
                _close($otysselect);
            }
        });
    }
}(jQuery));
