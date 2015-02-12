define(['aloha', 'aloha/plugin', 'jquery',  'aloha/console', 'block/block', 'block/blockmanager'], 
        function(Aloha, Plugin, jQuery, Console, block, BlockManager) {

            var editable = null;
            var range = null;

            // Define Page Break Block
            var ImageBlock = block.AbstractBlock.extend({
                title: 'Image',
                // we will use our own drag and drop directives
                // instead of alohas
                isDraggable: function() {return false;},
                init: function($element, postProcessFn) { 
                    // First we have to find the articleImageId
                    // we need the AngularJS injector
                    var $injector = angular.element($('body')).injector();
                    var contents = '';
                    $.each( $element.data(),function(name, value) {
                        if (name !== 'alohaBlockType') {
                            contents += ' data-image-'+name+'="'+value+'"';
                        }
                    });

                    $injector.invoke(function($rootScope, $compile) {
                        // finally place the element and $compile it into AngularJS
                        $element.empty().append($compile('<div dropped-image '+contents+'></div>')($rootScope));

                        $element.on('dragstart', function (e) {
                            var data = {
                                type: 'image',
                                id: $element.attr('data-id'),
                                articleImageId: $element.attr('data-articleimageid'),
                                width: '100%' 
                            }
                            e.originalEvent.dataTransfer.setData('Text', JSON.stringify(data));
                        });

                        $element.on('dragend', function (e) {
                            var alohaEditable = Aloha.getEditableById(
                                $element.parent('.aloha-editable-active').attr('id')
                            );
                            $element.remove();
                            // emit texteditor-content-changed event here
                            Aloha.trigger('aloha-smart-content-changed', {
                                'editable': alohaEditable,
                                'triggerType': 'paste',
                                'snapshotContent': alohaEditable.getContents()
                            });
                        });
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
                        var $injector = angular.element($('body')).injector();
                        var $this = jQuery(this);
                        var output = '';
                        if ($this.data('articleimageid') !== undefined) {
                            output += '<div class="image aloha-image-block"';
                            var contents = '';
                            $.each( $this.data(),function(name, value) {
                                if (name !== 'width' &&
                                    name !== 'alohaBlockType' &&
                                    name !== 'sortableitem') {
                                    contents += ' data-'+name+'="'+value+'"';
                                }
                            });
                                
                            // add width for newsccop render
                            contents += ' data-width="' + $this.width() + '%"';

                            output += contents + '></div>';
                        }

                        $injector.invoke(function($rootScope, $compile) {
                            $this.replaceWith($compile(output)($rootScope));
                        });
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
