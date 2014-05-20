'use strict';
angular.module('authoringEnvironmentApp').directive('droppedImage', [
    '$popover',
    function ($popover) {
        return {
            templateUrl: 'views/dropped-image.html',
            restrict: 'A',
            scope: {
                imageId: '@imageId',
                imageAlign: '@imageAlign',
                imageAlt: '@imageAlt',
                imageSub: '@imageSub',
                imageWidth: '@imageWidth',
                imageHeight: '@imageHeight'
            },
            link: function postLink(scope, element, attrs) {
                // the following code has to be entirely updated
                // the new scope.imageId etc has to be used to properly read the ID
                // of also included images
                //
                /*
                var id = element.attr('data-id');
                var includedId = scope.get(id);
                // handler for close button
                $(element).find('.close').click(function (e) {
                    scope.images.exclude(id);
                    element.remove();
                    e.stopPropagation();
                });
                $(element).click(function () {
                    scope.select(includedId);
                });
                $popover(element, {
                    placement: 'top',
                    html: true,
                    template: 'views/popover-image.html'
                });
                */
                // this is no longer needed
                //Aloha.jQuery(element).alohaBlock();
            }
        };
    }
]);
