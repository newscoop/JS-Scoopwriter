'use strict';

/**
* A directive which turns an HTML placeholder into an object embedded
* in the article body (e.g. a video clip).
*
* @class droppedSnippet
*/
angular.module('authoringEnvironmentApp').directive('droppedSnippet', [
    function () {
        return {
            restrict: 'E',
            templateUrl: 'views/dropped-snippet.html',
            controller: 'DroppedSnippetCtrl',
            scope: {
                snippetId: '@'
            },
            link: function postLink(scope, element, attrs, ctrl) {
                var snippetId = parseInt(scope.snippetId);

                element.find('.remove').on('click', function () {
                    // the parent is the actual Aloha block
                    element.parent().remove();
                });

                ctrl.init(snippetId);
            }
        };
    }
]);
