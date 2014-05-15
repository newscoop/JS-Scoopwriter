'use strict';

/**
* AngularJS controller for the article authors management pane.
*
* @class PaneAuthorsCtrl
*/
angular.module('authoringEnvironmentApp').controller('PaneAuthorsCtrl', [
    '$scope',
    'article',
    'Author',
    function ($scope, article, Author) {

        var self = this;

        // // TODO: we watch for author role changes like this,
        // // because we need the old value as well (API needs it),
        // // therefore we can't use ng-change for the role dropdown menu
        // $scope.$watchCollection($scope.authors, function (newVal, oldVal) {
        //     console.log('$scope.authors item changed');
        // });
        var setRoleChangeWatch = function (author, callback) {
            $scope.$watch(
                function () {
                    return author.articleRole;
                },
                function (newVal, oldVal) {
                    if (newVal === oldVal) {
                        return;  // listener called due to initialization
                    }
                    callback(newVal, oldVal, author);
                },
                true  // test object equality, not reference
            );
        };

        // TODO: comments & tests
        self.authorRoleChanged = function (newRole, oldRole, author) {
            article.promise.then(function (articleData) {
                author.updatingRole = true;
                author.oldRoleId = oldRole.id;  // XXX: explain hack

                author.$updateRole({
                    number: articleData.number,
                    language: articleData.language
                })
                .then(function (author) {
                    delete author.updatingRole;
                    delete author.oldRoleId;
                });
            });
        };

        $scope.authorRoles = Author.getRoleList();
        $scope.authors = [];

        article.promise.then(function (articleData) {
            return Author.getAll({
                number: articleData.number,
                language: articleData.language
            }).$promise;
        })
        .then(function (authors) {
            $scope.authors = authors;
            authors.forEach(function (author) {
                setRoleChangeWatch(author, self.authorRoleChanged);
            });
        });

    }
]);
