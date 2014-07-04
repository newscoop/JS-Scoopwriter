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
                    $toolbar;

                /**
                * Places the toolbar directly above the image and horizontally
                * aligns it based on the image alignment.
                * NOTE: If the toolbar handle is not yet available (i.e. it
                * has not been displayed yet), it does not do anything.
                *
                * @function positionToolbar
                */
                function positionToolbar() {
                    var cssFloat,
                        left,
                        top;

                    if (!$toolbar) {
                        return;
                    }

                    top = $imageBox.outerHeight() + $toolbar.outerHeight();
                    top = - Math.round(top);

                    cssFloat = $element.css('float');
                    if (cssFloat === 'left') {
                        left = 0;
                    } else if (cssFloat === 'right') {
                        left = $imageBox.outerWidth() - $toolbar.outerWidth();
                        left = Math.round(left);
                    } else {
                        left = $imageBox.outerWidth() - $toolbar.outerWidth();
                        left = Math.round(left / 2);
                    }

                    $toolbar.css({
                        top: top,
                        left: left
                    });
                }

                // Reposition the toolbar on image dimension changes.
                //
                // NOTE: setting a $watch on image width and height does not
                // work immediately on resizing changes caused by external
                // actions (e.g. opening a pane which shrinks the article
                // editor), because $digest cycle is not always triggered
                $element.mutate('height width', function (element,info) {
                    positionToolbar();
                });

                // close button's onClick handler
                $element.find('button.close').click(function (e) {
                    e.stopPropagation();
                    $element.remove();
                    ctrl.imageRemoved(scope.imageId);  // notify controller
                });

                // clicking the image displays the toolbar
                $imageBox.click(function (e) {
                    e.stopPropagation();
                    $toolbar = $toolbar || $('#img-toolbar-' + scope.imageId);
                    $toolbar.toggle();
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
                        'float': cssFloat,
                        'margin': cssMargin
                    });

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

                    $element.width(width);
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

                ctrl.init(scope.imageId);

            }  // end postLink function
        };
    }
]);
