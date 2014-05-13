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

        $scope.authorRoles = [];
        $scope.authors = [];

        $scope.authorRoles = articleAuthor.getRoleList();

        article.promise.then(function (articleData) {
            $scope.authors = articleAuthor.getAll({
                articleId: articleData.number,
                articleLang: articleData.language
            });
        });

        // TODO: comments & tests when done
        $scope.authorRoleChanged = function (author) {
            // implement ...
        };
    }
]);
