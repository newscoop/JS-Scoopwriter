
'use strict';

/**
* AngularJS controller for managing various actions on the 
* editorial comments, e.g. adding new comments, resolving comments etc.
*
* @class EditorialCommentsCtrl
*/
angular.module('authoringEnvironmentApp').controller('EditorialCommentsCtrl', [
    '$scope',
    '$timeout',
    'editorialComments',
    '$interval',
    'TranslationService',
    'toaster',
    function (
        $scope,
        $timeout,
        editorialComments,
        $interval,
        TranslationService,
        toaster
    ) {

    // Interval dely in seconds.
    // Comments will be loaded everytime
    // after defined value in seconds.
    var seconds = 20,
        self = this;

    self.comments = editorialComments;
    editorialComments.init();
    self.isLoading = false;
    self.create = {};
    self.isSending = false;

    /**
    * Initializes comments.
    * Sets isLoading accordingly.
    */
    self.initComments = function () {
        self.isLoading = true;
        editorialComments.init().then(function () {
            self.isLoading = false;
        });
    };

    /**
     * It fetches comments every 20 seconds to update
     * the curent list of editorial comments.
     */
    self.fetchComments = function () {
        var intervalPromise = $interval(self.initComments, seconds * 1000);

        // destroy interval because it will
        // not be automatically destroyed
        $scope.$on('$destroy', function() {
            if (angular.isDefined(intervalPromise)) {
                $interval.cancel(intervalPromise);
                intervalPromise = undefined;
            }
        });
    };

    /**
    * Cancels adding a new comment.
    *
    * @param {comment} comment Comment object
    */
    self.cancel = function (comment) {
        self.adding = false;
        self.create = {};
    };

    /**
    * Calls the editorial comment models add function
    *
    * @method add
    * @param parameters {Object} A wrapper around the object containing
    *   comment data.
    */
    self.add = function (parameters) {
        self.isSending = true;
        editorialComments.add(parameters).then(function () {
            self.adding = false;
            // collapse the form
            self.isSending = false;
            self.create = {};
            toaster.add({
                type: 'sf-info',
                message: TranslationService.trans(
                    'aes.msgs.comments.add.success'
                )
            });
        }, function () {
            // on failures (e.g. timeouts) we re-enable the form, allowing
            // user to submit a comment again
            self.isSending = false;
            toaster.add({
                type: 'sf-error',
                message: TranslationService.trans(
                    'aes.msgs.comments.add.error'
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
    self.sendReply = function (comment) {
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
    * Calls the comment models toggleResolved function
    *
    * @method toggleResolved
    * @param [comment] {comment} a specific comment to resolve
    */
    self.toggleResolved = function (comment) {
        comment.toggleResolved().then(function () {
            toaster.add({
                type: 'sf-info',
                message: TranslationService.trans(
                    'aes.msgs.editorialcomments.resolve.success'
                )
            });
        }, function () {
            toaster.add({
                type: 'sf-error',
                message: TranslationService.trans(
                    'aes.msgs.editorialcomments.resolve.error'
                )
            });
        });
    };

    /**
     * Saves comment
     *
     * @method saveComment
     * @param [comment] {comment} a specific comment to save
     */
    self.saveComment = function(comment) {
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
}]);