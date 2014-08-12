'use strict';
angular.module('authoringEnvironmentApp').controller('DroppedSnippetCtrl', [
    '$scope',
    '$sce',
    '$rootScope',
    'Snippet',
    'snippets',
    function ($scope, $sce, $rootScope, Snippet, snippets) {

        $scope.expanded = false;

        /**
        * Initializes the controller - it retrieves the specified snippet from
        * the server.
        *
        * @method init
        * @param snippetId {Number} ID of the snippet to retrieve
        */
        this.init = function (snippetId) {
            Snippet.getById(snippetId).then(function (snippet) {
                // explicitly tell Angular to trust snippet HTML (so that
                // <iframe> and similar tags are not filtered out)
                $scope.snippetHtml = $sce.trustAsHtml(snippet.render);
                $scope.snippet = snippet;
                snippets.addToIncluded(snippet.id);  // TODO: tests
            });
        };

        /**
        * A handler for event when snippet has been removed from the
        * snippets-in-article list.
        *
        * @method snippetRemoved
        * @param snippetId {Number} ID of the removed snippet
        */
        // TODO: tests
        this.snippetRemoved = function (snippetId) {
            snippets.removeFromIncluded(snippetId);
            $rootScope.$apply(snippets.inArticleBody);
        };

        $scope.snippets = snippets;  // TODO: test this

        /**
        * Sets the snippet display mode to expanded.
        * @method expand
        */
        $scope.expand = function () {
            $scope.expanded = true;
        };

        /**
        * Sets the snippet display mode to collapsed.
        * @method expand
        */
        $scope.collapse = function () {
            $scope.expanded = false;
        };
    }
]);