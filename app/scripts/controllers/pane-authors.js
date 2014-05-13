'use strict';

/**
* AngularJS controller for the article authors management pane.
*
* @class PaneAuthorsCtrl
*/
angular.module('authoringEnvironmentApp').controller('PaneAuthorsCtrl', [
    '$scope',
    'article',
    'articleAuthors',
    function ($scope, article, articleAuthors) {

        $scope.authorRoles = [];
        $scope.authors = [];

        $scope.authorRoles = articleAuthors.getRoleList();

        article.promise.then(function (articleData) {
            $scope.authors = articleAuthors.getAll({
                number: articleData.number,
                language: articleData.language
            });
        });

        // TODO: comments & tests when done
        $scope.authorRoleChanged = function (author) {
            // just an empty handler for now
            console.log(author);
        };
    }
]);
