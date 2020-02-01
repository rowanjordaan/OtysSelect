(function($){
    $.fn.otysselect = function(options){
        var _this = this;
        var _$this = $(_this);
        var userLang = navigator.language || navigator.userLanguage; 
        var output = { settings : {} }; // Return object for plugin

        // Extend default settings with options
        output.settings = $.extend({
             onInit: null, // Called on initialize (expects function)
             search: true, // Enable search
             MultiClearOptionsIfFalse: true, // Clear all options when value selected is zero with a mutliselect
             showLabels: true, // Appends labels in the input so you can see which options are selected with
             closeOnSelect: false, // Wheter to close the select dropdown when selecting a option
        });

        // Define execute function (contains all working logic)
        var _execute = function(select, callback){
            var $selectElement = $(select);
            var $selectElemented = ($selectElement.find('option[selected]').length) ? $selectElement.find('option[selected]') : $selectElement.find('option').first();
            var multiple = ($selectElement.attr('multiple')) ? true : false;

            var placeholder = $selectElement.parents('label').text();
            console.log('placeholder: '+ placeholder);

            // Wrap current select
            $selectElement.wrap('<div class="otysselect" multiple="'+ multiple +'"></div>');
            
            // Generate HTML
            var $html = '';
            $html += '<div class="os-select">';
                $html += '<div class="os-selected" data-value="'+ $selectElemented.attr('value') +'">\
                    <div class="os-value">';

                
                if(output.settings.showLabels){
                    // Display selected options
                    $selectElement.find('option').each(function(i, o){
                        if($(this).attr('selected')){
                            if(multiple){
                                $html += '<span class="os-label" data-label="'+ $(o).attr('label') +'" data-value="'+ $(o).attr('value') +'">'+ $(o).text() +'<span class="os-remove"></span></span>';
                            }else {
                                $html += $(o).text();
                            }
                        }
                    });
                }


                $html += '<span class="os-placeholder">'+ placeholder +'</span>\
                    </div>\
                </div>';

                $html += '<div class="os-collapse">';
                    if(output.settings.search){
                        $html += '<div class="os-search"><input type="text" class="os-searchfield" placeholder="Filter opties" /></div>';
                    }

                    $html += '<div class="os-options">';
                        $selectElement.find('> option, > optgroup').each(function(i, o){
                            console.log($(this));
                            
                            /* Check if the current el is an option if not this is an optgroup */
                            if($(o).is('option')){
                                var $option = $(o);
                                var selected = ($option.attr('selected') ? 'selected="selected"' : '');
                                $html += '<div class="os-option" data-search="'+ $option.text().toLowerCase() +'" '+ selected +' data-value="'+ $option.attr('value') +'">'+ $option.text() +'</div>';
                            }else if($(o).is('optgroup')){
                                $html += '<div class="os-optgroup"><div class="os-optgrouplabel">'+ $(o).text() + '</div>';
                                
                                /* because an optgroup contains options fill the optgroup with options */
                                $(o).find('option').each(function(oi, optgroupOption){
                                    var selected = ($(optgroupOption).attr('selected') ? 'selected="selected"' : '');
                                    $html += '<div class="os-option" data-search="'+ $(optgroupOption).text().toLowerCase() +'" '+ selected +' data-value="'+ $(optgroupOption).attr('value') +'">'+ $(optgroupOption).text() +'</div>';
                                });

                                $html += '</div>'; /*close os-optgroup*/
                            }
                        });
                    $html += '</div>'; /*close os-options*/
                $html += '</div>'; /*close os-collapse*/
            $html += '</div>'; /*close os-select */

            $selectElement.parent().append($html);

            // Run _execute callback if set and is a function
            if ( $.isFunction( callback ) ) {
                callback( result );
            }
        };

        // Define close function (closes option menu)
        var _close = function($otysselect){
            $otysselect.removeClass('open');
        };

        // Define initialize function (runs automaticly on init)
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
                if(!$(e.target).hasClass('os-remove')){
                    _close($('.otysselect').not($otysselect));

                    $otysselect.toggleClass('open');
                    $otysselect.find('.os-search input').focus();
                }
            });

            /* 
            * Select a option 
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
                        $otysselect.find('.os-option[data-value="'+ value +'"]').removeAttr('selected');
                    }else{
                        $(this).attr('selected', 'selelected');
                        $option.attr('selected', 'selected');

                        if(output.settings.showLabels){
                            // Display selected options
                            $otysselect.find('.os-value').append('<span class="os-label" data-label="'+ label +'" data-value="'+ value +'">'+ $(this).text() +'<span class="os-remove"></span></span>');
                        }
                    }
                    

                    if(output.settings.closeOnSelect){
                        _close($otysselect);
                    }
                });
            }else{
                $otysselect.on('click', '.os-option', function(e){
                    var value = $(this).attr('data-value');
                    var text = $(this).text();

                    $otysselect.find('.os-option').removeAttr('selected'); // Remove visible option
                    $otysselect.find('select option').removeAttr('selected'); // Remove actual select option
                    $otysselect.find('select option[value="'+ value +'"]').attr('selected', 'selected');
                    $(this).attr('selected', 'selelected');

                    $otysselect.find('.os-value').attr('data-value', value).text(text);

                    _close($otysselect);
                });
            }

            /* 
            * Delete a option when clicking selected item
            */
            $otysselect.on('click', '.os-label .os-remove', function(e){
                var value = $(this).parent().attr('data-value');
                $otysselect.find('select option[value="'+ value +'"]').removeAttr('selected');
                $otysselect.find('.os-option[data-value="'+ value +'"]').removeAttr('selected');
                $(this).parent().remove();
            });

            $otysselect.on('keyup', '.os-search input', function(){
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
