'use strict';

angular.module('authoringEnvironmentApp').directive('comment', function () {
    return {
        templateUrl: 'views/comment.html',
        restrict: 'E',
        scope: {
            model: '=',
            allowreplying: '='
        },
        link: function postLink(scope, element, attrs) {
        }
    };
});
