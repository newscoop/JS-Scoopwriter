'use strict';

angular.module('authoringEnvironmentApp')
    .directive('droppedImage', function () {
        return {
            templateUrl: 'views/dropped-image.html',
            restrict: 'A',
            link: function postLink(scope, element, attrs) {
                var id = element.attr('data-id');
                scope.get(id);
                scope.images.include(id);

                // handler for close button
                $(element).find('.close').click(function() {
                    scope.images.exclude(id);
                    element.remove();
                });

                var popoverMarkup = $(element)
                    .find('.popover-markup')
                    .detach()
                    .attr('style', '')
                    .get(0)
                    .outerHTML;

                // popover from modern jQuery (where bootstrap is
                // attached) and alohaBlock from aloha jQuery which is
                // an older version
                Aloha.jQuery($(element)
                    .popover({
                        placement: 'top',
                        container: '[data-id="'+id+'"] > .dropped-image',
                        html: true,
                        content: popoverMarkup
                    }))
                    .alohaBlock();
            }
        };
    });
