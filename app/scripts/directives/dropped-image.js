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
            // XXX: what is needed and what not?
            scope: {
                imageId: '@imageId',
                imageAlign: '@imageAlign',
                imageAlt: '@imageAlt',
                imageSub: '@imageSub',
                imageWidth: '@imageWidth',
                imageHeight: '@imageHeight'
            },
            link: function postLink(scope, element, attrs, ctrl) {
                var $element = $(element),
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
                * Places the toolbar directly above the image and horizontally
                * aligns it based on the image alignment.
                * NOTE: If the toolbar handle is not yet available (i.e. it
                * has not been displayed yet), it does not do anything.
                *
                * @function positionToolbar
                */
                function positionToolbar() {  // TODO: update comments
                        // TODO: remove mutate library of not needed anymore
                    var cssFloat,
                        left;

                    cssFloat = $parent.css('float');
                    if (cssFloat === 'left') {
                        left = 30;  // some space for Aloha block dragging tab
                    } else if (cssFloat === 'right') {
                        left = ($parent.outerWidth() - 30) - $toolbar.outerWidth();
                        left = Math.round(left);
                    } else {
                        left = ($imageBox.outerWidth() - 30) - $toolbar.outerWidth();
                        left = Math.round(left / 2);
                    }

                    toolbarNode().css({
                        left: left
                    });
                }


                // close button's onClick handler
                $element.find('button.close').click(function (e) {
                    e.stopPropagation();
                    $parent.remove();

                    // notify controller about the removal
                    ctrl.imageRemoved(parseInt(scope.imageId, 10));
                });

                // clicking the image displays the toolbar
                $imageBox.click(function (e) {
                    e.stopPropagation();
                    toolbarNode().toggle();
                });


                /**
                * Sets the image alignment and adjusts its margings depending
                * on the image position.
                *
                * @method align
                * @param position {String} new image alignment (should be one
                *   of the 'left', 'right' or 'center')
                */
                scope.align = function (position) {
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

                    // positionToolbar();  // TODO: set this (horizontal alignment)
                    // and on size change, too?
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

                scope.align('center');
                scope.setSize('medium');

                ctrl.init(parseInt(scope.imageId, 10));

            }  // end postLink function
        };
    }
]);
