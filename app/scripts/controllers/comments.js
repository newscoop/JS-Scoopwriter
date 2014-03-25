'use strict';

/**
* AngularJS controller for managing article comments (as a group,
* not individual comments).
*
* @class CommentsCtrl
*/
angular.module('authoringEnvironmentApp').controller(
    'CommentsCtrl', ['$scope', 'comments', 'article', '$location', '$log',
    function ($scope, comments, article, $location, $log) {

        var others = ['pending', 'approved', 'hidden'];

        $scope.sortings = [{
            text: 'Nested'
        }, {
            text: 'Chronological'
        }, {
            text: 'Chronological (asc.)'  // oldest first
        }];
        $scope.sorting = $scope.sortings[0];
        $scope.toggle = function(name) {
            var previouslyChecked = $scope.statuses[name];
            $scope.statuses[name] = !previouslyChecked;
            if ('all' == name) {
                if (previouslyChecked) {
                    others.map(function(name) {
                        $scope.statuses[name] = true;
                    });
                } else {
                    others.map(function(name) {
                        $scope.statuses[name] = false;
                    });
                }
            } else {
                /* if this is going to be unchecked (so it was checked
                 * before) and all the others are unchecked, check the
                 * `all` status again */
                if (previouslyChecked) {
                    if (others.every(function(name) {
                        return false == $scope.statuses[name];
                    })) {
                        $scope.statuses.all = true;
                    }
                } else {
                    $scope.statuses.all = false;
                }
            }
        };

        // commenting options ... (TODO: perhaps explain better, what this is)
        // TODO: and add tests

        // possible values
        var commenting = Object.freeze({
            ENABLED: 0,
            DISABLED: 1,
            LOCKED: 2
        });
        $scope.commenting = commenting.ENABLED;

        // this used for iterating in the scope
        $scope.commentingOpts = [
            {
                value: commenting.ENABLED,
                label: 'enabled'
            },
            {
                value: commenting.DISABLED,
                label: 'disabled'
            },
            {
                value: commenting.LOCKED,
                label: 'locked'
            }
        ];

        // TODO: YUIDoc comments ...
        this.init = function () {
             var queryParams = $location.search();

            article.resource.get({
                 articleId: queryParams.article_number,
                 language: queryParams.language
             }).$promise.then(function (data) {
                if (parseInt(data.comments_locked, 10) > 0) {
                    $scope.commenting = commenting.LOCKED;
                } else if (parseInt(data.comments_enabled, 10) > 0) {
                    $scope.commenting = commenting.ENABLED;
                } else {
                    $scope.commenting = commenting.DISABLED;
                }
            });
        }

        this.init();

        $scope.statuses = {
            all: true,
            pending: false,
            approved: false,
            hidden: false
        };
        $scope.selected = function(comment) {
            if ($scope.statuses.all) {
                return true;
            }
            if ($scope.statuses[comment.status]) {
                return true;
            }
            return false;
        };

         // whether or not a new comment is being sent at this very moment
        $scope.isSending = false;

        $scope.comments = comments;
        $scope.create = {};
        comments.init();
        $scope.add = function(par) {
            $scope.isSending = true;
            comments.add(par).then(function() {
                $scope.adding = false; // collapse the form
                $scope.isSending = false;
                $scope.create = {};
            }, function () {
                // on failures (e.g. timeouts) we re-enable the form, allowing
                // user to submit a comment again
                $scope.isSending = false;
            });
        };
        $scope.cancel = function() {
            $scope.adding = false;
            $scope.create = {};
        };
        $scope.globalShowStatus = 'collapsed';
        $scope.$watch('globalShowStatus', function() {
            comments.displayed.map(function(comment) {
                comment.showStatus = $scope.globalShowStatus;
            });
        });

        // TODO: comment and tests
        $scope.switchCommentingSetting = function (newValue, $event) {
            // XXX: maybe set it up in init and let it be "global" in the
            // comments service
            var queryParams = $location.search();

            $scope.commenting = newValue;
            return;

            $event.preventDefault();

            // TODO: look at the comments under the ticket to see how
            // PATCH should be invoked (parameters)
            article.resource.save(
                {
                    articleId: queryParams.article_number,
                    language: queryParams.language
                },
                {comments_enabled: !$scope.commentsEnabled}
            ).$promise.then(function (data) {
                // TODO: patch success, see what we got
                debugger;
                $scope.commentsEnabled = !$scope.commentsEnabled;
            }, function () {
                // failure ... TODO: this still makes checkbox checked
                //debugger;
                // or perhaps don't prevent the event and in case of an error,
                // revert to original value - better responsiveness?
            });
        };

        // TODO: comment and tests
        $scope.toggleCommentsLocked = function () {
            // TODO: contact server
            $scope.commentsLocked = !$scope.commentsLocked;
        };

        /**
        * Changes global comments display status from expanded to collapsed or
        * vice versa.
        * @method toggleShowStatus
        */
        $scope.toggleShowStatus = function () {
            $scope.globalShowStatus = ($scope.globalShowStatus === 'expanded')
                ? 'collapsed' : 'expanded';
        };

        $scope.$watch('sorting', function() {
            /* this log here is a way to test that the handler has
             * been called, it is mocked in tests */
            $log.debug('sorting changed');
            if(comments.canLoadMore) {
                if ($scope.sorting.text == 'Nested') {
                    comments.init({
                        sorting: 'nested'
                    });
                } else {
                    comments.init({
                        sorting: 'chronological'
                    });
                }
            }
        });
    }]);
