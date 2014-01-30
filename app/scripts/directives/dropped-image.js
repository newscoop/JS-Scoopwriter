'use strict';

angular.module('authoringEnvironmentApp')
    .directive('droppedImage', function () {
        var buttons = [{
            text: 'big'
        }, {
            text: 'medium'
        }, {
            text: 'small'
        }, {
            text: 'left'
        }, {
            text: 'right'
        }, {
            text: 'center'
        }];
        var popoverMarkup = buttons.map(function(b) {
            return $('<button>')
                .attr({
                'data-id': b.text
                })
                .text(b.text)
                .addClass('btn btn-default btn-xs')
                .get(0)
                .outerHTML;
        }).join('');
        return {
            templateUrl: 'views/dropped-image.html',
            restrict: 'A',
            link: function postLink(scope, element, attrs) {
                var id = element.attr('data-id');
                scope.get(id);

                // handler for close button
                $(element).find('.close').click(function() {
                    element.remove();
                });

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
