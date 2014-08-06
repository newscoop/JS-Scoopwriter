'use strict';

/**
* A directive which turns an image HTML snippet in article body into the actual
* content image.
*
* @class droppedImage
*/

angular.module('authoringEnvironmentApp').directive('droppedImage', [
    'configuration',
    '$log',
    function (configuration, $log) {
        return {
            restrict: 'A',
            templateUrl: 'views/dropped-image.html',
            controller: 'DroppedImageCtrl',
            scope: {
                imageId: '@imageId',
                alignment: '@imageAlignment',
                size: '@imageSize'
            },
            link: function postLink(scope, element, attrs, ctrl) {
                var imgConfig = {},
                    $element = $(element),
                    $imageBox = $element.find('.dropped-image'),
                    $parent = $element.parent(),  // Aloha block container
                    $toolbar;

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
                        $toolbar = $('#img-toolbar-' + scope.imageId);
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


                // close button's onClick handler
                $element.find('button.close').click(function (e) {
                    $parent.remove();

                    // notify controller about the removal
                    ctrl.imageRemoved(parseInt(scope.imageId, 10));
                });

                // clicking the image displays the toolbar
                $imageBox.click(function (e) {
                    toolbarNode().toggle();
                });

                /**
                * Sets the image alignment and adjusts its margings depending
                * on the image position.
                *
                * @method setAlignment
                * @param position {String} new image alignment (should be one
                *   of the 'left', 'right' or 'center')
                */
                scope.setAlignment = function (position) {
                    var cssFloat,
                        cssMargin;

                    switch (position) {
                    case 'left':
                        cssFloat = 'left';
                        cssMargin = '2% 2% 2% 0';
                        break;
                    case 'right':
                        cssFloat = 'right';
                        cssMargin = '2% 0 2% 2%';
                        break;
                    case 'center':
                        cssFloat = 'none';
                        cssMargin = '2% auto';
                        break;
                    default:
                        $log.warn('unknown image alignment:', position);
                        return;
                    }

                    $element.css({
                        'float': cssFloat
                    });

                    $parent.css({
                        'float': cssFloat,
                        'margin': cssMargin
                    });

                    if (position === 'center') {
                        $parent.css({margin: 'auto'});
                    }

                    $parent.attr('data-alignment', position);

                    positionToolbar();
                };

                /**
                * Sets the size of the image to one of the predifined sizes
                * (e.g. 'big'). If the given size is unknown, it sets the size
                * to the original size of the image.
                *
                * @method setSize
                * @param size {String} image size (e.g. 'small', 'medium',
                * 'big')
                */
                scope.setSize = function (size) {
                    var width;

                    if (size in configuration.image.width) {
                        width = configuration.image.width[size];
                    } else {
                        // set to original image size
                        width = scope.image.width;
                    }

                    $parent.width(width);
                    $element.css('width', '100%');
                    $parent.attr('data-size', size);

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
                scope.changePixelSize = function (width) {
                    if (angular.isNumber(width) && width > 0) {
                        $element.width(Math.round(width));
                    }
                };

                // set default values if needed and set image properties
                // XXX: for some reason the directive is sometimes fired twice
                // and values in scope (except for imageId) get lost. We thus
                // copy image properties to imgConfig object to preserve them.
                imgConfig.alignment = scope.alignment || 'center';
                imgConfig.size = scope.size || 'medium';

                ctrl.init(parseInt(scope.imageId, 10))
                .then(function () {
                    scope.setAlignment(imgConfig.alignment);
                    scope.setSize(imgConfig.size);
                });

            }  // end postLink function
        };
    }
]);
