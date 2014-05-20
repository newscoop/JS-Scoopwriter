define(['aloha', 'aloha/plugin', 'jquery',  'aloha/console', 'block/block', 'block/blockmanager'], 
        function(Aloha, Plugin, jQuery, Console, block, BlockManager) {

            var editable = null;
            var range = null;

            // Define Page Break Block
            var SnippetBlock = block.AbstractBlock.extend({
                title: 'Snippet',
                isDraggable: function() {return true;},
                init: function($element, postProcessFn) { 
                    // First we have to find the SnippetId
                    var snippetId = $element.data('id');
                    // we need the AngularJS injector
                    var $injector = angular.element($('body')).injector();
                    $injector.invoke(function($rootScope, $compile) {
                        // finally place the element and $compile it into AngularJS
                        $element.empty().append($compile('<dropped-snippet snippet="byId('+snippetId+')"></dropped-snippet>')($rootScope));
                    });
                    return postProcessFn();
                },
                update: function($element, postProcessFn) {

                    return postProcessFn();
                }
            });                 

            return Plugin.create('snippet', {
                makeClean: function(obj) {
                    jQuery(obj).find('.aloha-block-SnippetBlock').each(function() {
                        var $this = jQuery(this);
                        var output = '';
                        if ($this.data('id') !== undefined) {
                            output += '<div class="snippet" data-id="'+ parseInt($this.data('id')) +'"';
                            if ($this.data('snippetAlign') !== undefined) {
                                output += ' align="'+ $this.data('snippetAlign') +'"';
                            }
                            output += '></div>';
                        }

                        $this.replaceWith(output);
                    });
                },
                   init: function () {
                       // Register this block
                       BlockManager.registerBlockType('SnippetBlock', SnippetBlock);

                       // When editor is initialised check if there is any page break in our content.
                       // If there is initiate Page Break Block for each of the elements.
                       Aloha.bind('aloha-editable-created', function(event, editable) {
                           Aloha.jQuery(editable.obj.find('div.snippet')).alohaBlock({'aloha-block-type': 'SnippetBlock'});
                       });

                       Aloha.bind('aloha-my-undo', function(event, args) {
                           args.editable.obj.find('div.snippet').alohaBlock({'aloha-block-type': 'SnippetBlock'});
                       });
                   }
            });
        }
);
