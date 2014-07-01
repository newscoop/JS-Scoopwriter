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
                var imageId,
                    $element = $(element),
                    $imageBox = $element.find('.dropped-image'),
                    $toolbar;

                imageId = parseInt(element.attr('data-id'), 10);
                ctrl.init(imageId);

                // TODO: watch scope.image and when initialized,
                function initToolbar() {
                    // XXX: what about duplicate images? same image in
                    // article body twice?
                    if ($toolbar) {
                        return;
                    } else {
                        $toolbar = $('#img-toolbar-' + imageId);
                    }
                }

                // TODO: comments
                // TODO: add watch for image size and position changes
                function positionToolbar() {
                    var cssFloat,
                        left,
                        top;

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

                // close button's onClick handler
                $element.find('button.close').click(function (e) {
                    e.stopPropagation();
                    $element.remove();
                    ctrl.imageRemoved(imageId);  // notify controller
                    // TODO: also remove toolbar?
                });

                // clicking the image displays the toolbar
                $element.click(function (e) {
                    e.stopPropagation();
                    initToolbar();  // TODO: should be somewhere else
                    positionToolbar();
                    $toolbar.show();  // TODO: should toggle
                                // (or hide toolbar on hover)
                });

                // TODO: comments & tests
                scope.align = function (position) {
                    var cssFloat,
                        cssMargin,
                        img = scope.image;

                    switch (position) {
                    case 'left':
                        cssFloat = 'left';
                        if (img.size !== 'big') {
                            cssMargin = '0 2% 0 0';
                        }
                        break;
                    case 'right':
                        cssFloat = 'right';
                        if (img.size !== 'big') {
                            cssMargin = '0 0 0 2%';
                        }
                        break;
                    case 'center':
                        cssFloat = 'none';
                        cssMargin = '0 auto';
                        break;
                    default:
                        $log.warn('unknown image alignment:', position);
                        return;
                    }

                    $element.css({
                        'float': cssFloat,
                        'margin': cssMargin
                    });
                };

                // TODO: comments & tests
                // sizes: small, medium, big, original
                scope.setSize = function (size) {
                    // var img = scope.image;
                    // img.size = size;  // TODO: later
                    $element.width(configuration.image.width[size]);

                    if (size === 'big') {
                        $element.css('margin', '0');
                    } else if (size === 'original') {
                        $element.css('width', 'auto');
                        // i.style.image.width = 'auto';
                    } else {
                        // TODO: what is meant to be here??
                        // i.style.image = {};
                    }
                    positionToolbar();
                };

                // TODO: comments & tests
                scope.changePixelSize = function (width) {
                    var newWidth;

                    if (angular.isNumber(scope.pixels)) {
                        newWidth = scope.pixels + 'px';
                        // TODO: set this
                        // i.style.image.width = p;
                    }
                };
            }  // end postLink function
        };
    }
]);
