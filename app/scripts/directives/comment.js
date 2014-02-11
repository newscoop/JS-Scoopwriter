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
            }
        };
    });
