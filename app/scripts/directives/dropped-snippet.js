'use strict';
angular.module('authoringEnvironmentApp').directive('droppedSnippet', function () {
    return {
        templateUrl: 'views/dropped-snippet.html',
        restrict: 'E',
        scope: { snippet: '=' },
        link: function postLink(scope, element, attrs) {
            element.find('.remove').on('click', function () {
                // the parent is the aloha block. this is not the
                // nice clean way to do it, but it works for now
                element.parent().remove();
            });
            scope.expand = function () {
                element.find('.preview').html(scope.snippet.code);
                scope.expanded = true;
            };
            scope.collapse = function () {
                element.find('.preview').empty();
                scope.expanded = false;
            };
        }
    };
});