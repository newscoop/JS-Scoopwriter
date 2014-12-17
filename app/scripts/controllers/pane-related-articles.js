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
            previewArticle.loadContentFields().then(function(contentFields) {
                previewArticle.contentFields = contentFields;
            });
            previewArticle.loadFirstImage().then(function(firstImage) {
                // TODO: find best way to get full image url
                var url = 'http://newscoop.aes.sourcefabric.net/images/';
                previewArticle.firstImage = (firstImage) ? url + firstImage : null;
            });
            self.relatedArticlePreview = previewArticle;
            self.showArticlePreview = !self.showArticlePreview;
        }

        self.orderChange = function() {
            console.log('order changed!');
        };

        /**
        * Finds a list of relatedArticles that can be assigned to the article based on
        * the search query. RelatedArticles that are already selected or assigned to
        * the article are excluded from search results.
        *
        * @method loadSearchResults
        */
        self.loadSearchResults = function () {
            var ignored = {},
                filters = {},
                filtered,
                query;

            self.availableRelatedArticles = [];
            self.relatedArticleListRetrieved = false;

            // build a list of relatedArticle IDs to exclude from results (i.e. relatedArticles
            // that are already assigned to the article)
            self.assignedRelatedArticles.forEach(function (assignedArticle) {
                ignored[assignedArticle.articleId] = true;
            });

            query = (self.query) ? self.query.toLowerCase() : '';
            if (self.publicationFilter) {
                filters['publication'] = self.publicationFilter.title;
            }
            if (self.issueFilter) {
                filters['issue'] = self.issueFilter.title;
            }
            if (self.sectionFilter) {
                filters['section'] = self.sectionFilter.title;
            }

            article.searchArticles(query, filters).then(function (availableArticles) {
                self.relatedArticleListRetrieved = true;

                console.log(ignored);
                filtered = _.filter(availableArticles, function (filterArticle) {
                    return (!(filterArticle.articleId in ignored));
                });

                self.availableRelatedArticles = filtered;
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

            article.addRelatedArticle(relatedArticle).then(function (relatedArticles) {
                self.assignedRelatedArticles.push(relatedArticle);
                self.searchArticles(self.query); 
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
                _.remove(self.assignedRelatedArticles, {articleId: relatedArticle.articleId});
            });
        };
    }
]);
