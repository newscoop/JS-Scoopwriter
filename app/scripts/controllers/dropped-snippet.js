'use strict';
angular.module('authoringEnvironmentApp').controller('DroppedSnippetCtrl', [
    '$scope',
    '$sce',
    'Snippet',
    function ($scope, $sce, Snippet) {

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
            });
        };

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