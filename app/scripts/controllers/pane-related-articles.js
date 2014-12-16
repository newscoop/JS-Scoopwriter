'use strict';

/**
* AngularJS controller for the RelatedArticles pane.
*
* @class PaneRelatedArticlesCtrl
*/
angular.module('authoringEnvironmentApp').controller('PaneRelatedArticlesCtrl', [
    '$q',
    '$scope',
    'article',
    'modalFactory',
    'Section',
    function ($q, $scope, articleService, modalFactory, Section) {
        var self = this, 
            article = articleService.articleInstance,
            availableRelatedArticles = [],   // all existing relatedArticles to choose from
            filteredRelatedArticles = [],   // all existing relatedArticles to choose from
            relatedArticleListRetrieved = false,  // avilableRelatedArticles initialized yet?
            assigningRelatedArticles = false;  // relatedArticle assignment in progress?

        // load filter selects
        self.availableSections = Section.getAll();

        // retrieve all relatedArticles assigned to the article
        self.assignedRelatedArticles = article.getRelatedArticles();

        /**
         * Loads an article in the Related Articles preview pane
         *
         * @method previewReleatedArticle
         * @param article {Object} RelatedArtile
         */
        self.previewRelatedArticle = function(previewArticle) {
            var contentFields = previewArticle.loadContentFields();
            previewArticle.content_fields = contentFields;
            self.relatedArticlePreview = previewArticle;
            self.showArticlePreview = !self.showArticlePreview;
        }

        /**
        * Finds a list of relatedArticles that can be assigned to the article based on
        * the search query. RelatedArticles that are already selected or assigned to
        * the article are excluded from search results.
        *
        * @method findRelatedArticles
        * @param query {String} relatedArticles search query
        * @return {Object} promise object which is resolved with (filtered)
        *   search results
        */
        self.findRelatedArticles = function (query) {
            var ignored = {},
                filtered;

            // build a list of relatedArticle IDs to exclude from results (i.e. relatedArticles
            // that are already assigned to the article)
            self.assignedRelatedArticles.forEach(function (assignedArticle) {
                ignored[assignedArticle.number] = true;
            });

            // relatedArticles list is long, thus we only retrieve it once
            if (!self.relatedArticleListRetrieved) {
                self.availableRelatedArticles = article.getAll();
            }

            self.availableRelatedArticles.$promise.then(function () {
                self.relatedArticleListRetrieved = true;

                query = (query) ? query.toLowerCase() : '';
        
                filtered = _.filter(self.availableRelatedArticles, function (filterArticle) {
                    return (
                        !(filterArticle.number in ignored) &&
                        filterArticle.title.toLowerCase().indexOf(query) >= 0
                    );
                });

                self.filteredRelatedArticles =  filtered;
            });
        };

        /**
        * Assigns all currently selected relatedArticles to the article and then clears
        * the selected relatedArticles list.
        *
        * @method assignSelectedToArticle
        */
        self.assignToArticle = function (relatedArticle) {
            var self = this;
            self.assigningRelatedArticles = true;

            article.addRelatedArticle(
                article.articleId, article.language, relatedArticle
            ).then(function (relatedArticles) {
                self.assignedRelatedArticles.unshift(relatedArticle);
                self.findRelatedArticles($scope.query); 
            }).finally(function () {
                self.assigningRelatedArticles = false;
            });
        };

        /**
        * Asks user to confirm unassigning a relatedArticle from the article and then
        * unassignes the relatedArticle, if the action is confirmed.
        *
        * @method confirmUnassignRelatedArticle
        * @param relatedArticle {Object} relatedArticle to unassign
        */
        self.confirmUnassignRelatedArticle = function (relatedArticle) {
            var modal,
                title,
                text;

            title = 'Do you really want to unassign this relatedArticle from ' +
                'the article?';
            text = 'Should you change your mind, the relatedArticle can ' +
                'always be re-assigned again.';

            modal = modalFactory.confirmLight(title, text);

            modal.result.then(function () {
                return article.removeRelatedArticle(relatedArticle);
            }, $q.reject)
            .then(function () {
                _.remove(self.assignedRelatedArticles, {number: relatedArticle.articleId});
            });
        };
    }
]);
