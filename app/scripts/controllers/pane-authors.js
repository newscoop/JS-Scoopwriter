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

        /**
        * Sets a watch on the author object for its article role changes.
        *
        * NOTE: We can't simply use role dropdown menu's ng-change, because
        * we need to know the old role value, too (API requirement). Therefore
        * we manually set the watch, which provides us that value.
        *
        * @method setRoleChangeWatch
        * @param author {Object} author whose role changes to watch
        */
        var setRoleChangeWatch = function (author) {
            $scope.$watch(
                function () {
                    return author.articleRole;
                },
                function (newVal, oldVal) {
                    if (newVal === oldVal) {
                        return;  // listener called due to initialization
                    }
                    self.authorRoleChanged(newVal, oldVal, author);
                },
                true  // test object equality, not reference
            );
        };

        /**
        * Handles author's article role changed event. It triggers persisting
        * the change on the server.
        * While updating role is in progress, updatingRole flag is set on the
        * author object. If server responds with an error, author's role is
        * reverted back to the old role (before the role change took place).
        *
        * @method authorRoleChanged
        * @param newRole {Object} author's new role on the article
        * @param oldRole {Object} author's old role on the article
        * @param author {Object} author resource object itself
        */
        self.authorRoleChanged = function (newRole, oldRole, author) {
            article.promise.then(function (articleData) {
                author.updatingRole = true;

                author.updateRole({
                    number: articleData.number,
                    language: articleData.language,
                    oldRoleId: oldRole.id,
                    newRoleId: author.articleRole.id
                })
                .then(
                    null,
                    function () {
                        // on error simply revert back to old role
                        author.articleRole = oldRole;
                    }
                )
                .finally(function () {
                    author.updatingRole = false;
                });
            });
        };

        $scope.authorRoles = Author.getRoleList();
        $scope.authors = [];

        $scope.newAuthor = null;
        $scope.newAuthorRoleId = null;

        $scope.select2Options = {  // TODO: tests (default values)
            minimumInputLength: 3,
            query: Author.liveSearchQuery
        };

        // retrieve all article auhors from server
        article.promise.then(function (articleData) {
            return Author.getAll({
                number: articleData.number,
                language: articleData.language
            }).$promise;
        })
        .then(function (authors) {
            $scope.authors = authors;
            authors.forEach(function (author) {
                setRoleChangeWatch(author);
            });
        });
    }
]);
