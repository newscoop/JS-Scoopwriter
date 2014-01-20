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
                var s = scope.get({id: attrs.id});
                element.find('.title').text(s.title);
                element.find('.code').text(s.code);
            }
        };
    });
