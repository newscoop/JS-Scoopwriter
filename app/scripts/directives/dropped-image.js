'use strict';

/**
* A directive which turns an image HTML snippet in article body into the actual
* content image.
*
* @class droppedImage
*/

angular.module('authoringEnvironmentApp').directive('droppedImage', [
    '$popover',
    function ($popover) {
        return {
            restrict: 'A',
            // XXX: replace: true?
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
                    $element = $(element);

                imageId = parseInt(element.attr('data-id'), 10);
                ctrl.init(imageId);

                // close button's onClick handler
                $element.find('button.close').click(function (e) {
                    e.stopPropagation();
                    $element.remove();
                    ctrl.imageRemoved(imageId);  // notify controller
                });

                // $popover(element, {
                //     placement: 'top',
                //     html: true,
                //     template: 'views/popover-image.html'
                // });
            }
        };
    }
]);
