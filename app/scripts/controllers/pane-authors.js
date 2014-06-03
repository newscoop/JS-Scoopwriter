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
    'modalFactory',
    function ($scope, article, Author, modalFactory) {

        var self = this;

        /**
        * Sets a watch on the author object for its article role changes.
        * It also adds the stopRoleChangeWatch method to the object, which
        * can be used to, well, end the watch for role changes.
        *
        * NOTE: We can't simply use role dropdown menu's ng-change, because
        * we need to know the old role value, too (API requirement). Therefore
        * we manually set the watch, which provides us that value.
        *
        * @method setRoleChangeWatch
        * @param author {Object} author whose role changes to watch
        */
        self.setRoleChangeWatch = function (author) {
            var stopWatch = $scope.$watch(
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

            author.stopRoleChangeWatch = stopWatch;
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
                        // on error simply revert back to old role...

                        // NOTE: before the change we need to disable the watch
                        // so that the change is not detected and a new request
                        // is not sent to the server - which would result in
                        // another error, another role revert --> infinite loop
                        author.stopRoleChangeWatch();
                        author.articleRole = oldRole;
                        self.setRoleChangeWatch(author);
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
        $scope.addingNewAuthor = false;
        $scope.showAddAuthor = true;  // add author form expanded by default

        $scope.select2Options = {
            minimumInputLength: 3,
            query: Author.liveSearchQuery
        };

        /**
        * Resets all new author form fields.
        *
        * @method clearNewAuthorForm
        */
        $scope.clearNewAuthorForm = function () {
            $scope.newAuthor = null;
            $scope.newAuthorRoleId = null;
        };

        /**
        * Adds a new author to the article.
        *
        * @method addAuthorToArticle
        */
        $scope.addAuthorToArticle = function () {
            // NOTE: An author can be added multiple times (with different
            // roles), therefore we need multiple deep copies of the object to
            // distinguish between them in $scope.authors ng-repeat.
            var author = angular.copy($scope.newAuthor),
                roleId = $scope.newAuthorRoleId;

            $scope.addingNewAuthor = true;

            article.promise.then(function (articleData) {
                author.addToArticle(
                    articleData.number, articleData.language, roleId
                )
                .then(function () {
                    // append to the end, since this is the same way as it
                    // works on the server
                    $scope.authors.push(author);
                })
                .finally(function () {
                    $scope.addingNewAuthor = false;
                });
            });
        };

        /**
        * Asks user to confirm removing an author from the list of article
        * authors and then removes the author, if the action is confirmed.
        *
        * @method confirmRemoveAuthor
        * @param author {Object} author to remove
        */
        $scope.confirmRemoveAuthor = function (author) {
            var modal,
                title,
                text;

            title = 'Do you really want to remove this author?';
            text = 'Should you change your mind, the same author can ' +
                'always be added again.';

            modal = modalFactory.confirmLight(title, text);

            modal.result.then(function (data) {
                article.promise.then(function (articleData) {
                    return author.removeFromArticle(
                        articleData.number, articleData.language,
                        author.articleRole.id
                    );
                }).then(function () {
                    _.remove($scope.authors, function (item) {
                        return item === author;
                    });
                });
            });
        };

        /**
        * A handler to be called whenever the order of article authors changes.
        * It persists the new order on the server.
        * Used as a parameter to the drag-sort directive.
        *
        * @method orderChanged
        */
        // TODO: tests
        $scope.orderChanged = function () {
            article.promise.then(function (articleData) {
                Author.setOrderOnArticle(
                    articleData.number, articleData.language, $scope.authors);
            });
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
                self.setRoleChangeWatch(author);
            });
        });
    }
]);
