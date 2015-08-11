
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


	$scope.comments = editorialComments;
	editorialComments.init();
	$scope.stopRefreshing = false;
	$scope.isLoading = false;
    $scope.create = {};
    $scope.isSending = false;

    /**
     * It fetches comments every 20 seconds to update
     * the curent list of editorial comments.
     */
    $scope.fetchComments = function () {
        var intervalPromise = $interval(function(){
            if (!$scope.stopRefreshing) {
            	$scope.isLoading = true;
                editorialComments.init().then(function () {
	                $scope.isLoading = false;
	            });
            }
        }, 20000);

        // destroy interval as it is
        // not automatically destroyed
        $scope.$on('$destroy', function() {
            if (angular.isDefined(intervalPromise)) {
                $interval.cancel(intervalPromise);
                intervalPromise = undefined;
            }
        });
    };

    /**
    * Cancels adding new comment.
    *
    * @param {comment} comment Comment object
    */
    $scope.cancel = function (comment) {
        $scope.adding = false;
        $scope.create = {};
    };

    /**
    * Calls the editorial comment models add function
    *
    * @method add
    * @param parameters {Object} A wrapper around the object containing
    *   comment data.
    */
    $scope.add = function (parameters) {
        $scope.isSending = true;
        editorialComments.add(parameters).then(function () {
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
    * Calls the comment models toggleResolved function
    *
    * @method toggleResolved
    * @param [comment] {comment} a specific comment to resolve
    */
    $scope.toggleResolved = function (comment) {
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
    $scope.saveComment = function(comment) {
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