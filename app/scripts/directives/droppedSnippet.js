'use strict';

angular.module('authoringEnvironmentApp')
    .directive('droppedSnippet', function () {
        return {
            templateUrl: 'views/dropped-snippet.html',
            restrict: 'E',
            scope: {
                id: '@',
                get: '&'
            },
            link: function postLink(scope, element, attrs) {
                scope.preview = false;
                function render() {
                    if (scope.preview) {
                        element.find('.render-area').html(s.code);
                        element.find('.toggle').text('code');
                    } else {
                        element.find('.render-area').text(s.code);
                        element.find('.toggle').text('preview');
                    }
                }
                var s = scope.get({id: attrs.id});
                element.find('.title').text(s.title);
                element.find('.toggle')
                    .on('click', function() {
                        scope.preview = !scope.preview;
                        render();
                    });
                render();
            }
        };
    });
