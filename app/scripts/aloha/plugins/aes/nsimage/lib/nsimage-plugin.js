define(['aloha', 'aloha/plugin', 'jquery',  'aloha/console', 'block/block', 'block/blockmanager'], 
        function(Aloha, Plugin, jQuery, Console, block, BlockManager) {

            var editable = null;
            var range = null;

            // Define Page Break Block
            var ImageBlock = block.AbstractBlock.extend({
                title: 'Image',
                isDraggable: function() {return true;},
                init: function($element, postProcessFn) { 
                    // First we have to find the ImageId
                    var imageId = $element.data('id');
                    // we need the AngularJS injector
                    var $injector = angular.element($('body')).injector();
                    //var $droppedImage = jQuery('<div dropped-image></div>');
                    var contents = '';
                    $.each( $element.data(),function(name, value) {
                        if (name !== 'alohaBlockType') {
                            contents += ' data-image-'+name+'="'+value+'"';
                        }
                    });
                    $injector.invoke(function($rootScope, $compile) {
                        // finally place the element and $compile it into AngularJS
                        $element.empty().append($compile('<div dropped-image '+contents+'></div>')($rootScope));
                    });
                    return postProcessFn();
                },
                update: function($element, postProcessFn) {

                    return postProcessFn();
                }
            });                 

            return Plugin.create('image', {
                makeClean: function(obj) {
                    jQuery(obj).find('.aloha-block-ImageBlock').each(function() {
                        var $this = jQuery(this);
                        var output = '';
                        if ($this.data('id') !== undefined) {
                            output += '<div class="image"';

                            var contents = '';
                            $.each( $this.data(),function(name, value) {
                                if (name !== 'alohaBlockType' && name !== 'sortableitem') {
                                    contents += ' data-'+name+'="'+value+'"';
                                }
                            });

                            output += contents + '></div>';
                        }

                        $this.replaceWith(output);
                    });
                },
                   init: function () {
                       // Register this block
                       BlockManager.registerBlockType('ImageBlock', ImageBlock);

                       // When editor is initialised check if there is any page break in our content.
                       // If there is initiate Page Break Block for each of the elements.
                       Aloha.bind('aloha-editable-created', function(event, editable) {
                           Aloha.jQuery(editable.obj.find('div.image')).alohaBlock({'aloha-block-type': 'ImageBlock'});
                       });

                       Aloha.bind('aloha-my-undo', function(event, args) {
                           args.editable.obj.find('div.image').alohaBlock({'aloha-block-type': 'ImageBlock'});
                       });
                   }
            });
        }
);
