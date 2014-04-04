'use strict';

/**
* AngularJS controller for managing article comments (as a group,
* not individual comments).
*
* @class CommentsCtrl
*/
angular.module('authoringEnvironmentApp').controller('CommentsCtrl', [
    '$scope',
    'comments',
    'article',
    'modalFactory',
    '$log',
    function ($scope, comments, article, modalFactory, $log) {

        var others = [
                'pending',
                'approved',
                'hidden'
            ];
        $scope.sortings = [
            { text: 'Nested' },
            { text: 'Chronological' },
            { text: 'Chronological (asc.)' }  // oldest first
        ];

        $scope.sorting = $scope.sortings[0];
        $scope.toggle = function (name) {
            var previouslyChecked = $scope.statuses[name];
            $scope.statuses[name] = !previouslyChecked;
            if ('all' === name) {
                if (previouslyChecked) {
                    others.map(function (name) {
                        $scope.statuses[name] = true;
                    });
                } else {
                    others.map(function (name) {
                        $scope.statuses[name] = false;
                    });
                }
            } else {
                /* if this is going to be unchecked (so it was checked
                 * before) and all the others are unchecked, check the
                 * `all` status again */
                if (previouslyChecked) {
                    if (others.every(function (name) {
                            return false === $scope.statuses[name];
                        })) {
                        $scope.statuses.all = true;
                    }
                } else {
                    $scope.statuses.all = false;
                }
            }
        };

        $scope.commentingSettingSrv = article.commenting.ENABLED;  // default
        $scope.commentingSetting = $scope.commentingSettingSrv;
        $scope.commentingOptDirty = false;  // commentingSetting changed?
        $scope.isChangingCommenting = false;  // currently submitting change?

        $scope.commenting = article.commenting;

        $scope.commentingOpts = [
            {
                value: article.commenting.ENABLED,
                text: 'Enabled'
            },
            {
                value: article.commenting.DISABLED,
                text: 'Disabled'
            },
            {
                value: article.commenting.LOCKED,
                text: 'Locked'
            }
        ];
        /**
        * Stores the current value of the `commenting` setting of the article
        * to which the comments belong.
        * @method initCommenting
        */
        this.initCommenting = function () {
            article.promise.then(function (data) {
                if (parseInt(data.comments_locked, 10) > 0) {
                    $scope.commentingSettingSrv = article.commenting.LOCKED;
                } else if (parseInt(data.comments_enabled, 10) > 0) {
                    $scope.commentingSettingSrv = article.commenting.ENABLED;
                } else {
                    $scope.commentingSettingSrv = article.commenting.DISABLED;
                }
                $scope.commentingSetting = $scope.commentingSettingSrv;
            });
        };
        this.initCommenting();
        $scope.statuses = {
            all: true,
            pending: false,
            approved: false,
            hidden: false
        };
        $scope.selected = function (comment) {
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
        $scope.add = function (par) {
            $scope.isSending = true;
            comments.add(par).then(function () {
                $scope.adding = false;
                // collapse the form
                $scope.isSending = false;
                $scope.create = {};
            }, function () {
                // on failures (e.g. timeouts) we re-enable the form, allowing
                // user to submit a comment again
                $scope.isSending = false;
            });
        };
        $scope.cancel = function () {
            $scope.adding = false;
            $scope.create = {};
        };
        $scope.globalShowStatus = 'collapsed';
        $scope.$watch('globalShowStatus', function () {
            comments.displayed.map(function (comment) {
                comment.showStatus = $scope.globalShowStatus;
            });
        });
        /**
        * Sets or clears the commenting option's dirty flag, depending on
        * whether or not the current value of the option in the model
        * differs from the value of the same option on the server.
        *
        * @method updateCommentingDirtyFlag
        */
        $scope.updateCommentingDirtyFlag = function () {
            $scope.commentingOptDirty =
                ($scope.commentingSetting !== $scope.commentingSettingSrv);
        };

        /**
        * Changes the value of the article's commenting setting and updates
        * it on the server. In case of an erroneous server response it
        * restores the setting back to the original value (i.e. the value
        * before the change attempt).
        *
        * @method changeCommentingSetting
        */
        $scope.changeCommentingSetting = function () {
            var newValue = $scope.commentingSetting,
                origValue = $scope.commentingSettingSrv;

            $scope.isChangingCommenting = true;

            article.changeCommentingSetting(newValue).then(function (data) {
                // value on the server successfully changed
                $scope.commentingSettingSrv = newValue;
            }, function () {
                // XXX: when consistent reporting mechanism is developed,
                // inform user about the error (API failure) - the reason
                // why the value has been switched back to origValue
                $scope.commentingSetting = origValue;
            }).finally(function () {
                $scope.updateCommentingDirtyFlag();
                $scope.isChangingCommenting = false;
            });
        };
        /**
        * Changes global comments display status from expanded to collapsed or
        * vice versa.
        * @method toggleShowStatus
        */
        $scope.toggleShowStatus = function () {
            $scope.globalShowStatus =
                ($scope.globalShowStatus === 'expanded') ?
                'collapsed' : 'expanded';
        };

        $scope.$watch('sorting', function () {
            /* this log here is a way to test that the handler has
             * been called, it is mocked in tests */
            $log.debug('sorting changed');
            if (comments.canLoadMore) {
                if ($scope.sorting.text === 'Nested') {
                    comments.init({ sorting: 'nested' });
                } else {
                    comments.init({ sorting: 'chronological' });
                }
            }
        });

        /**
        * Returns the number of currently selected comments (among those
        * displayed).
        *
        * @method countSelected
        */
        $scope.countSelected = function () {
            var count = 0;
            comments.displayed.forEach(function (comment) {
                if (comment.selected) {
                    count++;
                }
            });
            return count;
        };

        /**
        * Asks user for confirmation of the HIDE action (by displaying a
        * modal) and then, if the action is confirmed, hides selected
        * comments.
        *
        * @method confirmHideSelected
        */
        $scope.confirmHideSelected = function () {
            var modal,
                title = 'Do you really want to hide selected comments?',
                text = 'Comments\' content will not be visible to users.';

            modal = modalFactory.confirmLight(title, text);

            modal.result.then(function (data) {
                comments.changeSelectedStatus('hidden');
            }, function (reason) {
                // nothing to do
            });
        };

        /**
        * Asks user for confirmation of the DELETE action (by displaying a
        * modal) and then, if the action is confirmed, deletes selected
        * comments as well as all of their subcomments.
        *
        * @method confirmDeleteSelected
        */
        $scope.confirmDeleteSelected = function () {
            var modal,
                title = 'Are you SURE you want to delete selected comments?',
                text = 'modal body text ... changes are IRREVERSIBLE!';

            modal = modalFactory.confirmHeavy(title, text);

            modal.result.then(function (data) {
                console.log('modal result OK');  // TODO: delete
                // TODO: comments.changeSelectedStatus('deleted')
                // ... or invoke DELETE on comments service (changing status
                // is not enough)
            }, function (reason) {
                // nothing to do
            });
        };

    }
]);
