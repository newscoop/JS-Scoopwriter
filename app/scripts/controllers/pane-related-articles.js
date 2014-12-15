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
    'RelatedArticle',
    function ($q, $scope, articleService, modalFactory, Section, RelatedArticle) {
        var article = articleService.articleInstance,
            availableRelatedArticles = [],   // all existing relatedArticles to choose from
            relatedArticleListRetrieved = false;  // avilableRelatedArticles initialized yet?

        $scope.selectedRelatedArticles = [];
        $scope.assigningRelatedArticles = false;  // relatedArticle assignment in progress?

        // load filter selects
        $scope.availableSections = Section.getAll();

        console.log($scope.availableSections);

        // retrieve all relatedArticles assigned to the article
        $scope.assignedRelatedArticles = RelatedArticle.getAllByArticle(
            article.articleId, article.language
        );

        /**
         * Loads an article in the Related Articles preview pane
         *
         * @method previewReleatedArticle
         * @param article {Object} RelatedArtile
         */
        $scope.previewRelatedArticle = function(article) {
            $scope.relatedArticlePreview = article;
            $scope.showArticlePreview = !$scope.showArticlePreview;
        }

        /**
        * Clears the list of currently selected relatedArticles.
        *
        * @method clearSelectedRelatedArticles
        */
        $scope.clearSelectedRelatedArticles = function () {
            while ($scope.selectedRelatedArticles.length > 0) {
                $scope.selectedRelatedArticles.pop();
            }
        };

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
        $scope.findRelatedArticles = function (query) {
            var ignored = {},
                filtered;

            // build a list of relatedArticle IDs to exclude from results (i.e. relatedArticles
            // that are already selected and/or assigned to the article)
            $scope.selectedRelatedArticles.forEach(function (article) {
                ignored[article.number] = true;
            });
            $scope.assignedRelatedArticles.forEach(function (article) {
                ignored[article.number] = true;
            });

            // relatedArticles list is long, thus we only retrieve it once
            if (!relatedArticleListRetrieved) {
                availableRelatedArticles = RelatedArticle.getAll();
            }

            availableRelatedArticles.$promise.then(function () {
                relatedArticleListRetrieved = true;

                query = (query) ? query.toLowerCase() : '';
        
                filtered = _.filter(availableRelatedArticles, function (article) {
                    return (
                        !(article.number in ignored) &&
                        article.title.toLowerCase().indexOf(query) >= 0
                    );
                });

                $scope.availableRelatedArticles =  filtered;
            });
        };

        /**
        * Assigns all currently selected relatedArticles to the article and then clears
        * the selected relatedArticles list.
        *
        * @method assignSelectedToArticle
        */
        $scope.assignSelectedToArticle = function () {
            $scope.assigningRelatedArticles = true;

            RelatedArticle.addToArticle(
                article.articleId, article.language, $scope.selectedRelatedArticles
            ).then(function (relatedArticles) {
                relatedArticles.forEach(function (item) {
                    $scope.assignedRelatedArticles.push(item);
                });
                $scope.clearSelectedRelatedArticles();
            }).finally(function () {
                $scope.assigningRelatedArticles = false;
            });

            // XXX: what about errors, e.g. 409 Conflict?
        };

        /**
        * Asks user to confirm unassigning a relatedArticle from the article and then
        * unassignes the relatedArticle, if the action is confirmed.
        *
        * @method confirmUnassignRelatedArticle
        * @param relatedArticle {Object} relatedArticle to unassign
        */
        $scope.confirmUnassignRelatedArticle = function (relatedArticle) {
            var modal,
                title,
                text;

            title = 'Do you really want to unassign this relatedArticle from ' +
                'the article?';
            text = 'Should you change your mind, the relatedArticle can ' +
                'always be re-assigned again.';

            modal = modalFactory.confirmLight(title, text);

            modal.result.then(function () {
                return relatedArticle.removeFromArticle(
                    article.articleId, article.language);
            }, $q.reject)
            .then(function () {
                _.remove($scope.assignedRelatedArticles, {number: relatedArticle.number});
            });
        };
    }
]);
