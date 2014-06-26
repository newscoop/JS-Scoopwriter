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
                var imageId = parseInt(element.attr('data-id'), 10);
                ctrl.init(imageId);

                // XXX: set event handlers if neccessary
                // (or have them in the template? think about it...)

                // var includedId = scope.get(id);
                // // handler for close button
                // $(element).find('.close').click(function (e) {
                //     scope.images.exclude(id);
                //     element.remove();
                //     e.stopPropagation();
                // });
                // $(element).click(function () {
                //     scope.select(includedId);
                // });
                // $popover(element, {
                //     placement: 'top',
                //     html: true,
                //     template: 'views/popover-image.html'
                // });
            }
        };
    }
]);
