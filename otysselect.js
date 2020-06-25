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
            closeOnSelect: false, // Wheter to close the select dropdown when selecting an option
            placeholder: false, // When true a placeholder will be shown when there are no options selected
            defaultPlaceholder: 'Select an option', // When placeholder is true, but the placeholder attribute is not on the element used this as fallback text
            mobileNative: true, // When a user uses a mobile phone use the native select box on click
        }, options);

        // Define functions
        const isMobile = function() {
            var userAgent = navigator.userAgent || navigator.vendor || window.opera;
          
            // Check if user agent is windows, iphone or android phone && device is touchscreen
            if (/windows phone/i.test(userAgent) || (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) ||  (/android/i.test(userAgent)) && ( 'ontouchstart' in window ) ||  ( navigator.maxTouchPoints > 0 ) || ( navigator.msMaxTouchPoints > 0 )){
                return true
            }
          
            return false;
        }

        // Store is_mobile in variable
        var is_mobile = isMobile();

        /*
        * Define execute function (contains all working logic)
        */
        var _execute = function(select, callback){
            var $selectElement = $(select);
            var $selectElemented = ($selectElement.find('option[selected]').length) ? $selectElement.find('option[selected]') : $selectElement.find('option').first();
            var is_multiselect = ($selectElement.attr('multiple')) ? true : false;

            // Check if mobile and if use mobile native is enabled
            if(output.settings.mobileNative && is_mobile){
                $selectElement.attr('data-os-nativemobile', true);
            }

            // Wrap current select
            $selectElement.wrap('<div class="otysselect" is_multiselect="'+ is_multiselect +'"></div>');
            
            var $otysselect = $selectElement.parent();

            /*
                Generate HTML
            */
            var $html = '';
            $html += '<div class="os-select">';
                $html += '<div class="os-selected" data-value="'+ $selectElemented.attr('value') +'">\
                    <div class="os-value">';

                
                if(output.settings.showLabels){
                    // Display selected options
                    $selectElement.find('option').each(function(i, o){
                        if($(this).attr('selected')){
                            if(is_multiselect){
                                $html += '<span class="os-label" data-label="'+ $(o).attr('label') +'" data-value="'+ $(o).attr('value') +'">'+ $(o).text() +'<span class="os-remove"></span></span>';
                            }else {
                                $html += $(o).text();
                            }
                        }
                    });
                }
                    
                    // When placeholder is enabled for multiselect
                    if(is_multiselect && output.settings.placeholder) {
                        var placeholder = (typeof $selectElement.attr('placeholder') != 'undefined') ? $selectElement.attr('placeholder') :  output.settings.defaultPlaceholder;
                        
                        $html += '<span class="os-placeholder">'+ placeholder +'</span>';
                    }
                $html += '</div>\
                </div>';

                $html += '<div class="os-collapse">';
                    if(output.settings.search){
                        $html += '<div class="os-search"><input type="text" class="os-searchfield" placeholder="Filter opties" /></div>';
                    }

                    $html += '<div class="os-options">';
                        $selectElement.find('> option, > optgroup').each(function(i, o){
                            /* Check if the current el is an option if not this is an optgroup */
                            if($(o).is('option')){
                                var $option = $(o);
                                var selected = ($option.attr('selected') ? 'selected="selected"' : '');
                                var disabled = ($option.attr('disabled') ? 'disabled="disabled"' : '')
                                $html += '<div class="os-option" data-search="'+ $option.text().toLowerCase() +'" '+ selected +' ' + disabled + ' data-value="'+ $option.attr('value') +'">'+ $option.text() +'</div>';
                            }else if($(o).is('optgroup')){
                                $html += '<div class="os-optgroup"><div class="os-optgrouplabel">'+ $(o).attr('label') + '</div>';
                                
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
                    

            // Define remove select function
            output.unselect = function(select){
                $(select).parent().find('.os-select').remove();
                $(select).unwrap();
            };

            /*
            *   Bind events
            */
            /* 
                Opening select 
            */
            $otysselect.on('click', '.os-selected', function(e){
                if(!$(e.target).hasClass('os-remove')){
                    _close($('.otysselect').not($otysselect));

                    $otysselect.toggleClass('open');
                    $otysselect.find('.os-search input').focus();
                }
            });

            /* 
                Select an option 
            */
            var selectOption = function(value){
                var $osOption = $otysselect.find('.os-options .os-option[data-value="'+ value +'"]');
                var $option = $otysselect.find('select option[value="'+ value +'"]');

                console.log($option);

                $osOption.attr('selected', 'selelected');
                $option.attr('selected', 'selected');

                // Show values
                if(output.settings.showLabels){
                    var label = $option.attr('label');
                    var labelHTML = '<span class="os-label" data-label="'+ label +'" data-value="'+ value +'">'+ $option.text() +'<span class="os-remove"></span></span>';

                    if($otysselect.find('.os-label[data-value="'+ value +'"]').length <= 0){
                        if( output.settings.placeholder ){
                            $(labelHTML).insertBefore($otysselect.find('.os-value .os-placeholder'));
                        }else{
                            $(labelHTML).appendTo($otysselect.find('.os-value'));
                        }
                    }
                }
            };

            var desselectOption = function(value){
                var $osOption = $otysselect.find('.os-options .os-option[data-value="'+ value +'"]');
                var $option = $otysselect.find('select option[value="'+ value +'"]');

                // Remove the current option if it was already selected
                $option.removeAttr('selected'); // Remove actual select option
                $otysselect.find('.os-value span[data-value="'+ value +'"]').remove();
                $otysselect.find('.os-option[data-value="'+ value +'"]').removeAttr('selected');
            }

            var toggleOption = function(value){
                var $option = $otysselect.find('select option[value="'+ value +'"]');
                var $osOption = $otysselect.find('.os-options .os-option[data-value="'+ value +'"]');
                
                if(is_multiselect){
                    if($option.attr('selected')){
                        desselectOption(value);
                    }else{
                        // Mark current option as selected if the current option was not selected yet
                        selectOption(value);
                    }
                    
                    if(output.settings.closeOnSelect){
                        _close($otysselect);
                    }
                }else{
                    $otysselect.find('.os-option').removeAttr('selected'); // Remove visible option
                    $otysselect.find('select option').removeAttr('selected'); // Remove actual select option
                    $otysselect.find('select option[value="'+ value +'"]').attr('selected', 'selected');
                    $option.attr('selected', 'selected');
                    $osOption.attr('selected', 'selected');

                    $otysselect.find('.os-value').attr({'data-value' : value}).text($option.text()); // Show value

                    _close($otysselect);
                }
            }

            /*
                Original select
            */
            $selectElement.on('change', function(e){
                var $this = $(this);

                if(!$this.hasClass('manualchange')){
                    if(is_multiselect){
                        $this.find('option').each(function(index, option){
                            var value = $(option).attr('value');
                            if($(option).is(':selected')){
                                selectOption(value);
                            }else{
                                desselectOption(value);
                            }
                        });
                    }else{
                        toggleOption($this.val());
                    }
                }else{
                    $this.removeClass('manualchange');
                }
            });

            /* 
                Select an option binding 
            */
            $otysselect.on('click', '.os-option:not([disabled])', function(e){
                var $osOption = $(this);
                var value = $osOption.attr('data-value');

                toggleOption(value);

                $otysselect.find('select').addClass('manualchange').change();
            });

            /* 
            * Delete an option when clicking selected item binding
            */
            $otysselect.on('click', '.os-label .os-remove', function(e){
                var value = $(this).parent().attr('data-value');
                $otysselect.find('select option[value="'+ value +'"]').removeAttr('selected');
                $otysselect.find('.os-option[data-value="'+ value +'"]').removeAttr('selected');
                $(this).parent().remove();
            });

            /*
            * Search functionality
            */
            if(output.settings.search){
                $otysselect.on('keyup', '.os-search input', function(){
                    $otysselect.find('.os-option').show();

                    if($(this).val().length){
                        $otysselect.find('.os-option:not([data-search*="'+ $(this).val().toLowerCase() +'"])').hide();
                    }
                });
            }

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
        var __initialize = function(selectElement){
            $(selectElement).attr('data-os', 'loaded');

            var data = _execute(selectElement);

            if ( $.isFunction( output.settings.onInit ) ) {
                output.settings.onInit(data);
            }

            return data;
        };

        this.each(function(instanceNumber, selectElement){
            var $select = $(selectElement);

            /*
            *   Run first instance & Generate HTML
            */
            // First check if otysselect is not yet initialized for this element
            if($select.attr('data-os') != 'loaded'){
                __initialize(selectElement);
            }

            return __initialize();
        });

        /*
        * Close open selects when clicking outside a select
        */
        $(document).on('mouseup', function(e){
            var $otysselect = $('.otysselect');

            // if the target of the click isn't the container nor a descendant of the container
            if (!$otysselect.is(e.target) && $otysselect.has(e.target).length === 0){
                _close($otysselect);
            }
        });

        return output;
    };
}(jQuery));
