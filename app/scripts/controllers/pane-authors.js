'use strict';

/**
* AngularJS controller for the article authors management pane.
*
* @class PaneAuthorsCtrl
*/
angular.module('authoringEnvironmentApp').controller('PaneAuthorsCtrl', [
    '$scope',
    'article',
    'articleAuthor',
    function ($scope, article, articleAuthor) {

        $scope.authors = [];

        // TODO: tests & comments
        this.retrieveAuthors = function () {
            article.promise.then(function (articleData) {
                $scope.authors = articleAuthor.getAll({
                    articleId: articleData.number,
                    articleLang: articleData.language
                });
            });
        };

        this.retrieveAuthors();
    }
]);
