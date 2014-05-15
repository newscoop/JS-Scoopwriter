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
        * @param callback {Function} function to invoke when role change occurs
        */
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

        /**
        * Handles author's article role changed event. It triggers persisting
        * the change on the server.
        *
        * @method authorRoleChanged
        * @param newRole {Object} author's new role on the article
        * @param oldRole {Object} author's old role on the article
        * @param author {Object} author resource object itself
        */
        // TODO: tests
        self.authorRoleChanged = function (newRole, oldRole, author) {
            article.promise.then(function (articleData) {
                author.updatingRole = true;

                // A hack to circumvent $resource object's limitations.
                // We pass the author's old role ID in through the author
                // object itself, so that we know what value to put into
                // request headers (API expects special headers).
                author.oldRoleId = oldRole.id;

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
                setRoleChangeWatch(author, self.authorRoleChanged);
            });
        });

    }
]);
