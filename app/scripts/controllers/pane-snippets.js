'use strict';
angular.module('authoringEnvironmentApp').controller('PaneSnippetsCtrl', [
    '$scope',
    '$q',
    'article',
    'Snippet',
    'SnippetTemplate',
    'modalFactory',
    function ($scope, $q, article, Snippet, SnippetTemplate, modalFactory) {

        // TODO: comments
        $scope.toggleEdit = function (snippet, editMode) {
            snippet.editing = editMode;
            snippet.expanded = editMode;

            // TODO: copy snippet data and restore if user cancels
            // editing
        };

        /**
        * Resets all new snippet form fields.
        *
        * @method clearNewSnippetForm
        */
        $scope.clearNewSnippetForm = function () {
            $scope.newSnippet.name = '';
            $scope.newSnippet.template = null;

            // deep reset of all template fields' values
            $scope.snippetTemplates.forEach(function (template) {
                template.fields.forEach(function (field) {
                    delete field.value;
                });
            });
        };

        /**
        * Creates a new snippet and then attaches it to the article.
        *
        * @method addNewSnippetToArticle
        * @param snippetData {Object} object describing the new snippet
        *   @param snippetData.name {String} new snippet's name
        *   @param snippetData.template {Object} object describing snippet
        *     template used for the new snippet
        *     @param snippetData.template.id {Number} ID of the template
        *     @param snippetData.template.fields {Object} Array containing
        *       objects representing the template fields. Each object must
        *       have a "name" property and a "fromValue" property (value of
        *       the field as entered by user).
        */
        $scope.addNewSnippetToArticle = function (snippetData) {
            var fields = {},
                newSnippet;

            $scope.addingNewSnippet = true;

            snippetData.template.fields.forEach(function (field) {
                fields[field.name] = field.value;
            });

            Snippet.create(
                snippetData.name, snippetData.template.id, fields
            )
            .then(function (snippet) {
                newSnippet = snippet;
                return article.promise;
            }, $q.reject)
            .then(function (articleData) {
                return newSnippet.addToArticle(
                    articleData.number, articleData.language);
            }, $q.reject)
            .then(function () {
                $scope.snippets.push(newSnippet);
            })
            .finally(function () {
                $scope.addingNewSnippet = false;
            });
        };

        // TODO: comments
        $scope.updateSnippet = function (snippet) {
            console.log('$scope.updateSnippet()', snippet);

            // TODO: save changes (idea: only if there was a change,
            // otherwise no need to send a request to server)
        };

        /**
        * Asks user to confirm detaching a snippet from the article and then
        * detaches a snippet, if the action is confirmed.
        *
        * @method confirmRemoveSnippet
        * @param snippet {Object} snippet to detach
        */
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

            modal.result.then(function () {
                return article.promise;
            }, $q.reject)
            .then(function (articleData) {
                // NOTE: detach snippet from article but don't delete it,
                // because it might be attached to some other article, too
                // (in theory at least)
                return snippet.removeFromArticle(
                    articleData.number, articleData.language);
            }, $q.reject)
            .then(function () {
                _.remove($scope.snippets, function (item) {
                    return item === snippet;
                });
            });
        };

        // TODO: init UI flags like editing, expanded etc. for
        // snippets objects? on load and on adding new snippet
        // (set $watchCollection, just like in authors?)
        // (idea: perhaps wrap all UI flags into snippet.UI object
        // snippet.UI.editing, snippet.UI.expanded, snippet.UI.copy)

        $scope.showAddSnippet = false;

        $scope.newSnippet = {
            name: '',
            template: null
        };
        $scope.addingNewSnippet = false;

        $scope.inputFieldTypes = Object.freeze({
            integer: 'number',
            text: 'text',
            url: 'url'
        });

        $scope.snippetTemplates = SnippetTemplate.getAll();

        // initialization: retrieve all article snippets from server
        article.promise.then(function (articleData) {
            $scope.snippets = Snippet.getAllByArticle(
                articleData.number, articleData.language);
        });
    }
]);