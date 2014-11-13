'use strict';

/**
* AngularJS service for keeping track of which snippets are attached to the
* current article being edited and which of those are used in article content.
*
* @class snippets
*/
angular.module('authoringEnvironmentApp').service('snippets', [
    '$log',
    'article',
    'Snippet',
    function ($log, articleService, Snippet) {
        var article = articleService.articleInstance,
            self = this;

        self.article = article;

        // list of snippets attached to the article
        self.attached = Snippet.getAllByArticle(
            article.articleId, article.language);

        // list of snippet IDs in article body
        self.inArticleBody = {};

        /**
        * Adds a particular snippet to the list of snippets included in
        * article body.
        *
        * @method addToIncluded
        * @param snippetId {Number} ID of the snippet
        */
        self.addToIncluded = function (snippetId) {
            self.inArticleBody[snippetId] = true;
        };

        /**
        * Removes a particular snippet from the list of snippets included in
        * article body.
        *
        * @method removeFromIncluded
        * @param snippetId {Number} ID of the snippet
        */
        self.removeFromIncluded = function (snippetId) {
            delete self.inArticleBody[snippetId];
        };


        /**
        * Creates and returns a comparison function. This functions accepts an
        * object with the "id" attribute as a parameter and returns true if
        * object.id is equal to the value of the "id" parameter passed to
        * the method. If not, the created comparison function returns false.
        *
        * @method matchMaker
        * @param id {Number} Value to which the object.id will be compared in
        *   the comparison function (can also be a numeric string).
        *   NOTE: before comparison the parameter is converted to integer
        *   using the built-in parseInt() function.
        *
        * @return {Function} Generated comparison function.
        */
        self.matchMaker = function (id) {
            return function (needle) {
                return parseInt(needle.id) === parseInt(id);
            };
        };

        /**
        * Attaches a single snippet to the article. If the snippet is already
        * attached, it does not do anything. On successful server response
        * it also updates the list of attached snippets.
        *
        * @method addToArticle
        * @param snippet {Object} Snippet instance to attach
        * @param article {Object} article to which the snippet should
        *   be attached.
        * @return {Object} promise object that is resolved when the snippet
        *   has been successfully attached to the article
        */
        self.addToArticle = function (snippet, article) {
            var match = self.matchMaker(snippet.id),
                promise;

            if (_.find(self.attached, match)) {
                $log.warn('Snippet', snippet.id, 'is already attached.');
                return;
            }

            promise = snippet.addToArticle(
                article.articleId, article.language);

            promise.then(function () {
                self.attached.push(snippet);
            });
            return promise;
        };


        /**
        * Detaches a single image from the article. If the snippet is not
        * attached to the article, it does not do anything.
        *
        * @method removeFromArticle
        * @param snippet {Object} Snippet instance to detach
        * @param article {Object} article from which the snippet should
        *   be detached.
        * @return {Object} promise object that is resolved when the snippet
        *   has been successfully detached from the article
        */
        self.removeFromArticle = function (snippet, article) {
            var match = self.matchMaker(snippet.id),
                promise;

            if (!_.find(self.attached, match)) {
                $log.warn('Snippet', snippet.id, 'is already detached.');
                return;
            }
            // XXX: perhaps add an extra check if snippet is in article body?

            promise = snippet.removeFromArticle(
                article.articleId, article.language);

            promise.then(function () {
                _.remove(self.attached, match);
            });

            return promise;
        };
    }
]);
