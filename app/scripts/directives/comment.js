'use strict';

angular.module('authoringEnvironmentApp')
    .directive('comment', function () {
        return {
            templateUrl: 'views/comment.html',
            restrict: 'E',
            scope: {
                model: '='
            },
            link: function postLink(scope, element, attrs) {
                var indent;
                if (scope.model.thread_level) {
                    indent = scope.model.thread_level * 20;
                    element.attr('style', 'margin-left: ' + indent + 'px');
                }
            }
        };
    });
