'use strict';
angular.module('authoringEnvironmentApp').directive('droppedImage', [
    '$popover',
    function ($popover) {
        return {
            templateUrl: 'views/dropped-image.html',
            restrict: 'A',
            link: function postLink(scope, element, attrs) {
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
                Aloha.jQuery(element).alohaBlock();
            }
        };
    }
]);