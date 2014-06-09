'use strict';
angular.module('authoringEnvironmentApp').controller('PaneSnippetsCtrl', [
    '$scope',
    'article',
    'Snippet',
    'modalFactory',
    function ($scope, article, Snippet, modalFactory) {

        // TODO: init UI flags like editing, expanded etc. for
        // snippets objects? on load and on adding new snippet
        // (set $watchCollection, just like in authors?)
        // (idea: perhaps wrap all UI flags into snippet.UI object
        // snippet.UI.editing, snippet.UI.expanded, snippet.UI.copy)

        $scope.showAddSnippet = false;  // TODO: test default value

        // TODO: comments
        $scope.toggleEdit = function (snippet, editMode) {
            snippet.editing = editMode;
            snippet.expanded = editMode;

            // TODO: copy snippet data and restore if user cancels
            // editing
        };

        // TODO: comments
        $scope.updateSnippet = function (snippet) {
            console.log('$scope.updateSnippet()', snippet);

            // TODO: save changes (idea: only if there was a change,
            // otherwise no need to send a request to server)
        };

        // TODO: comments
        $scope.confirmRemoveSnippet = function (snippet) {
            var modal,
                title,
                text;

            // XXX: for now these texts stays in the controller, but should be
            // moved to some general config section at some point, when we
            // implement it in some refactoring sprint
            title = 'Do you really want to remove this snippet?';
            text = 'Should you change your mind, the snippet can ' +
                'always be added again.';

            modal = modalFactory.confirmLight(title, text);

            modal.result.then(function (data) {
                console.log('TODO: remove snippet', snippet);
            });
        };

        // initialization: retrieve all article snippets from server
        article.promise.then(function (articleData) {
            $scope.snippets = Snippet.getAllByArticle(
                articleData.number, articleData.language);
        });
    }
]);