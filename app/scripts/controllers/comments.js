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
    'Article',
    'modalFactory',
    '$log',
    'TranslationService',
    'toaster',
    function (
        $scope,
        comments,
        articleService,
        Article,
        modalFactory,
        $log,
        TranslationService,
        toaster) {

        var article = articleService.articleInstance,
            others = [
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

        $scope.commentingSettingSrv = Article.commenting.ENABLED;  // default
        $scope.commentingSetting = $scope.commentingSettingSrv;
        $scope.commentingOptDirty = false;  // commentingSetting changed?
        $scope.isChangingCommenting = false;  // currently submitting change?

        $scope.commenting = Article.commenting;

        $scope.commentingOpts = [
            {
                value: Article.commenting.ENABLED,
                text: 'Enabled'
            },
            {
                value: Article.commenting.DISABLED,
                text: 'Disabled'
            },
            {
                value: Article.commenting.LOCKED,
                text: 'Locked'
            }
        ];

        /**
        * Stores the current value of the "commenting" setting of the article
        * to which the comments belong.
        *
        * @method initCommenting
        */
        this.initCommenting = function () {
            if (article.comments_locked) {
                $scope.commentingSettingSrv = Article.commenting.LOCKED;
            } else if (article.comments_enabled) {
                $scope.commentingSettingSrv = Article.commenting.ENABLED;
            } else {
                $scope.commentingSettingSrv = Article.commenting.DISABLED;
            }
            $scope.commentingSetting = $scope.commentingSettingSrv;
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
                toaster.add({
                    type: 'sf-info',
                    message: TranslationService.trans(
                        'aes.msgs.comments.add.success'
                    )
                });
                
            }, function () {
                // on failures (e.g. timeouts) we re-enable the form, allowing
                // user to submit a comment again
                $scope.isSending = false;
                toaster.add({
                    type: 'sf-error',
                    message: TranslationService.trans(
                        'aes.msgs.comments.add.error'
                    )
                });
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
        * Saves comment
        *
        * @method saveComment 
        * @param [comment] {comment} a specific comment to save
        */
        $scope.saveComment = function (comment) {
            comment.save().then(function () {
                toaster.add({
                    type: 'sf-info',
                    message: TranslationService.trans(
                        'aes.msgs.comments.edit.success'
                    )
                });
            }, function () {
                toaster.add({
                    type: 'sf-error',
                    message: TranslationService.trans(
                        'aes.msgs.comments.edit.error'
                    )
                });
            });
        };

        /**
        * Calls the comment models sendReply function 
        *
        * @method sendReply 
        * @param [comment] {comment} a specific comment to reply to
        */
        $scope.sendReply = function (comment) {
            comment.sendReply().then(function () {
                toaster.add({
                    type: 'sf-info',
                    message: TranslationService.trans(
                        'aes.msgs.comments.reply.success'
                    )
                });
            }, function () {
                toaster.add({
                    type: 'sf-error',
                    message: TranslationService.trans(
                        'aes.msgs.comments.reply.error'
                    )
                });
            });
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

            article.changeCommentingSetting(newValue).then(function () {
                // value on the server successfully changed
                $scope.commentingSettingSrv = newValue;
                toaster.add({
                    type: 'sf-info',
                    message: TranslationService.trans(
                        'aes.msgs.comments.change.success'
                    )
                });
            }, function () {
                $scope.commentingSetting = origValue;
                toaster.add({
                    type: 'sf-error',
                    message: TranslationService.trans(
                        'aes.msgs.comments.change.error'
                    )
                });
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
        * comments (if commentId is not given) or hide a specific comment
        * (if commentId is given).
        *
        * @method confirmHideSelected
        * @param [commentId] {Number} ID of a specific comment to hide
        */
        $scope.confirmHideComments = function (commentId) {
            var commentIdGiven = (typeof commentId !== 'undefined'),
                modal,
                title,
                text;

            title = TranslationService.trans(
                'aes.msgs.comments.hide.popupHead'
            );
            text = TranslationService.trans(
                'aes.msgs.comments.hide.popup'
            );

            modal = modalFactory.confirmLight(title, text);

            modal.result.then(function (data) {
                if (commentIdGiven) {
                    comments.changeSelectedStatus('hidden', false, commentId);
                } else {
                    comments.changeSelectedStatus('hidden', false);
                }
                toaster.add({
                    type: 'sf-info',
                    message: TranslationService.trans(
                        'aes.msgs.comments.hide.success'
                    )
                });
            }, function (reason) {
                toaster.add({
                    type: 'sf-error',
                    message: TranslationService.trans(
                        'aes.msgs.comments.hide.error'
                    )
                });
            });
        };

        /**
        * Asks user for confirmation of the DELETE action (by displaying a
        * modal) and then, if the action is confirmed, deletes selected
        * comments (if commentId is not given) or delete a specific comment
        * (if commentId is given).
        * All the subcomments below the deleted comment(s) are deleted as well.
        *
        * @method confirmDeleteSelected
        * @param [commentId] {Number} ID of a specific comment to delete
        */
        $scope.confirmDeleteComments = function (commentId) {
            var commentIdGiven = (typeof commentId !== 'undefined'),
                modal,
                title,
                text;

            title = TranslationService.trans(
                'aes.msgs.comments.delete.popupHead'
            );
            text = TranslationService.trans(
                'aes.msgs.comments.delete.popup'
            );

            modal = modalFactory.confirmHeavy(title, text);

            modal.result.then(function (data) {
                if (commentIdGiven) {
                    comments.changeSelectedStatus('deleted', true, commentId);
                } else {
                    comments.changeSelectedStatus('deleted', true);
                }
                toaster.add({
                    type: 'sf-info',
                    message: TranslationService.trans(
                        'aes.msgs.comments.delete.success'
                    )
                });
            }, function (reason) {
                toaster.add({
                    type: 'sf-error',
                    message: TranslationService.trans(
                        'aes.msgs.comments.delete.error'
                    )
                });
            });
        };

    }
]);
