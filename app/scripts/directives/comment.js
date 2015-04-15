'use strict';

angular.module('authoringEnvironmentApp').directive('comment', function () {
    return {
        templateUrl: 'views/comment.html',
        restrict: 'E',
        scope: {
            model: '=',
            allowreplying: '=',
            onHide: '&confirmHideComments',
            onDelete: '&confirmDeleteComments',
            onSave: '&saveComment',
            onReply: '&sendReply'
        },
        link: function postLink(scope, element, attrs) {
        }
    };
});
