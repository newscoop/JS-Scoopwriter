'use strict';

angular.module('authoringEnvironmentApp').directive('editorialComment',
    function () {
        return {
            templateUrl: 'views/editorial-comment.html',
            restrict: 'E',
            scope: {
                model: '=',
                allowreplying: '=',
                onSave: '&saveComment',
                onReply: '&sendReply',
                onResolve: '&resolve'
            },
            link: function postLink(scope, element, attrs) {
            }
        };
    }
);
