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

        // TODO: tests for default values ... and isDefined in scope
        $scope.authors = [];
        $scope.authorRoles = [];

        this.retrieveAuthorRoles = function () {
            $scope.authorRoles = articleAuthor.getRoleList();
        };

        // TODO: tests & comments
        // TODO: should this be a stand-alone code? don't need function?
        this.retrieveAuthors = function () {
            article.promise.then(function (articleData) {
                $scope.authors = articleAuthor.getAll({
                    articleId: articleData.number,
                    articleLang: articleData.language
                });
            });
        };

        this.retrieveAuthors();
        this.retrieveAuthorRoles();

        // TODO: comments & tests
        $scope.authorRoleChanged = function (author, $event) {
            // TODO: check newVal, possible get old val as well
            // TODO: article ... we need it so that we can send params to
            // articleAuthor service
            var newRoleId = author.articleRole.id;
            // TODO: now update author's role
            // on success change author object value (author.roleId)

            // in the mean time (suring, disable dropdown of course
        };
    }
]);
