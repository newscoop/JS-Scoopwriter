'use strict';

/**
* A directive which turns an image HTML snippet in article body into the actual
* content image.
*
* @class droppedImage
*/

angular.module('authoringEnvironmentApp').directive('droppedImage', [
    '$log',
    '$timeout',
    function ($log, $timeout) {
        return {
            restrict: 'A',
            templateUrl: 'views/dropped-image.html',
            controller: 'DroppedImageCtrl',
            scope: {
                articleImageId: '@imageArticleimageid',
                alignment: '@imageAlign',
                size: '@imageSize'
            },
            require: ['dropped-image', '^^dropped-images-container'],
            link: function postLink(scope, element, attrs, controllers) {
                var ctrl = controllers[0],
                    imgConfig = {},
                    parentCtrl = controllers[1],
                    $element = $(element),
                    $imageBox = $element.find('.dropped-image'),
                    $parent = $element.parent(),  // Aloha block container
                    $toolbar;

                // which size and alignment are currently applied to the image
                scope.activeSize = null;
                scope.activeAlignment = null;

                /**
                * Retrieves a jQuery reference to the image toolbar node. It
                * also makes sure that the toolbar is a direct child of the
                * Aloha block node.
                *
                * The function contains additional check if $toolbar reference
                * has not been obtained yet (useful for cases when DOM node
                * might not yet exist).
                *
                * @function toolbarNode
                * @return {Object}
                */
                function toolbarNode() {
                    var element;
                    if (!$toolbar || $toolbar.length < 1) {
                        $toolbar = $('#img-toolbar-' + scope.image.id);
                        element = $toolbar.detach();
                        $parent.append(element);
                    }
                    return $toolbar;
                }

                /**
                * Places the toolbar above the image and horizontally
                * aligns it based on the image alignment.
                *
                * @function positionToolbar
                */
                function positionToolbar() {
                    var cssFloat,
                        left,
                        top,
                        $bar = toolbarNode();

                    cssFloat = $parent.css('float');
                    if (cssFloat === 'left') {
                        left = 0;
                    } else if (cssFloat === 'right') {
                        left = $parent.outerWidth() - $bar.outerWidth();
                        left = Math.round(left);
                    } else {
                        left = $imageBox.outerWidth() - $bar.outerWidth();
                        left = Math.round(left / 2);
                    }

                    // leave some space for Aloha block drag tab
                    top = -($bar.outerHeight() + 15);

                    toolbarNode().css({left: left, top: top});
                }

                /**
                * Emits an aloha event which triggers the editor save button
                *
                * @function triggerChangeEvent
                */
                function triggerChangeEvent() {
                    var alohaEditable = Aloha.getEditableById(
                        $parent.parent('.aloha-editable-active').attr('id')
                    );
                    if (alohaEditable) {
                        Aloha.trigger('aloha-smart-content-changed', {
                            'editable': alohaEditable,
                            'triggerType': 'paste',
                            'snapshotContent': alohaEditable.getContents()
                        });
                    }
                }


                // close button's onClick handler
                $element.find('button.close').click(function (e) {
                    $parent.remove();

                    // notify controller about the removal
                    ctrl.imageRemoved(scope.image.id);
                });

                $element.find('.caption').click(function (e) {
                    e.stopPropagation();
                });

                // clicking the image displays the toolbar
                $imageBox.click(function (e) {
                    parentCtrl.toggleToolbar(toolbarNode());
                });

                element.on('$destroy', function() {
                    parentCtrl.deregisterToolbar(toolbarNode());
                });

                /**
                * Sets the image alignment and adjusts its margings depending
                * on the image position.
                *
                * @method setAlignment
                * @param position {String} new image alignment (should be one
                *   of the 'left', 'right' or 'middle')
                */
                scope.setAlignment = function (position) {
                    var cssFloat,
                        cssMargin;

                    switch (position) {
                    case 'left':
                        cssFloat = 'left';
                        cssMargin = '2% 2% 2% 0';
                        scope.activeAlignment = 'left';
                        break;
                    case 'right':
                        cssFloat = 'right';
                        cssMargin = '2% 0 2% 2%';
                        scope.activeAlignment = 'right';
                        break;
                    case 'middle':
                        cssFloat = 'none';
                        cssMargin = '2% auto';
                        scope.activeAlignment = 'middle';
                        break;
                    default:
                        $log.warn('unknown image alignment:', position);
                        scope.activeAlignment = null;
                        return;
                    }

                    $element.css({
                        'float': cssFloat
                    });

                    $parent.css({
                        'float': cssFloat,
                        'margin': cssMargin
                    });

                    if (position === 'middle') {
                        $parent.css({margin: 'auto'});
                    }

                    $parent.attr('data-align', position);

                    triggerChangeEvent();
                    positionToolbar();
                };

                /**
                * Sets the size of the image to one of the predifined sizes
                * (e.g. 'big') or to the exact width in pixels. If the given
                * size is unknown, it sets the width to the original size of
                * the image.
                *
                * @method setSize
                * @param size {String} image size (e.g. 'small', 'medium',
                *   'big', '82px')
                * @param initPhase {Boolean} a flag indicating whether the
                *    method is invoked during the init phase (when the image
                *    has just been retrieved but not rendered yet)
                */
                scope.setSize = function (size, initPhase) {
                    var width;

                    if (size.match(/^\d+px$/)) {
                        width = size.substring(0, size.length - 2);
                        scope.changePixelSize(parseInt(width));
                        scope.activeSize = 'custom';
                        positionToolbar();
                        return;
                    } else if (size in AES_SETTINGS.image.width) {
                        width = AES_SETTINGS.image.width[size];
                        scope.activeSize = size;
                    } else {
                        // set to original image size (NOTE: add 2px because
                        // border width is subtracted from image width due to
                        // the "border-box" box-sizing property that we use)
                        width = scope.image.width + 2 + 'px';
                        scope.activeSize = 'original';
                    }

                    // NOTE: use .css() instead of .width() as the latter
                    // does not set the desired pixel width due to "border-box"
                    // box-sizing CSS property that we use
                    $parent.css('width', width);
                    $element.css('width', '100%');
                    $parent.attr('data-size', size);

                    scope.widthPx = $element.innerWidth();
                    if (initPhase) {
                        // in the init phase, innerWidth returns width with
                        // border included, thus we need to adjust for that
                        scope.widthPx -= 2;
                    }

                    triggerChangeEvent();
                    positionToolbar();
                };

                /**
                * Sets the width of the image to the specified number of
                * pixels. Image height is left intact (to let the browser
                * automatically adjust it).
                *
                * @method changePixelSize
                * @param width {Number} image width in pixels
                */
                // XXX: unify this method and the setSize method as they serve
                // the same purpose
                scope.changePixelSize = function (width) {
                    if (angular.isNumber(width) && width > 0) {
                        width = Math.round(width);
                        $element.css('width', width + 'px');

                        // add 2px to parent to account for child's border
                        // NOTE: must use .css() instead of .width() to set
                        // the exact size in pixels (b/c we use "border-box"
                        // box-sizing property)
                        $parent.css('width', width + 2 + 'px');
                        $parent.attr('data-size', width + 'px');

                        scope.widthPx = width;
                        scope.activeSize = 'custom';
                        
                        triggerChangeEvent();
                        positionToolbar();
                    }
                };
                
                // set default values if needed and set image properties
                // XXX: for some reason the directive is sometimes fired twice
                // and values in scope (except for articleImageId) get lost.
                // We thus copy image properties to imgConfig object to
                // preserve them.
                imgConfig.alignment = scope.alignment || 'middle';
                imgConfig.size = scope.size || AES_SETTINGS.image_size;

                ctrl.init(parseInt(scope.articleImageId, 10))
                .then(function () {
                    scope.setAlignment(imgConfig.alignment);
                    scope.setSize(imgConfig.size, true);

                    // asynchronously re-position the toolbar b/c initially,
                    // $bar.outerWidth() returns null instead of the bar's
                    // actual width, causing an incorrect initial positioning
                    $timeout(positionToolbar, 0);
                });

            }  // end postLink function
        };
    }
]);
