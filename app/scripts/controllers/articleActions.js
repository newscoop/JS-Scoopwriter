'use strict';

/**
* AngularJS controller for managing various actions on the article, e.g.
* changing the article's workflow status.
*
* @class ArticleActionsCtrl
*/
angular.module('authoringEnvironmentApp').controller('ArticleActionsCtrl', [
    '$scope',
    'article',
    'mode',
    function ($scope, article, mode) {

        // a flag indicating if article content has been changed at most
        // once (after the watch on the article is set)
        var firstArticleChange = true;

        $scope.mode = mode;
        $scope.articleService = article;

        // list of possible article workflow status options to choose from
        $scope.workflowStatuses = [
            {
                value: article.wfStatus.NEW,
                text: 'New'
            },
            {
                value: article.wfStatus.SUBMITTED,
                text: 'Submitted'
            },
            {
                value: article.wfStatus.PUBLISHED,
                text: 'Published'
            },
            {
                value: article.wfStatus.PUBLISHED_W_ISS,
                text: 'Published with issue'
            }
        ];

        $scope.wfStatus = $scope.workflowStatuses[0];  // default value is New
        $scope.changingWfStatus = false;

        $scope.articleService.promise.then(function (article) {
            var statusObj;

            $scope.article = article;

            // set a watch on article's content changes
            // XXX: better listen on editor-content-changed event?
            $scope.$watch('article', function (newValue, oldValue) {
                if (newValue === oldValue) {
                    return;  // called due to watcher initialization, skip
                }
                // The first article change is triggered when any images and
                // snippets placeholders in article fields get deserialized to
                // the actual HTML code. This happens soon after the article is
                // retrieved from the API (initialization phase) and we don't
                // consider that as a "real" article content change. Therefore
                // we ignore the event on its first occurrence.
                if (firstArticleChange) {
                    firstArticleChange = false;
                    return;
                }
                $scope.setModified(true);
            }, true);

            // set workflow status to the actual article's workflow status
            statusObj = _.find(
                $scope.workflowStatuses, {value: article.status}
            );
            $scope.wfStatus = statusObj;
        });

        /**
        * Changes article's workflow status. It also disables the corresponding
        * dropdown menu until the API request is completed.
        *
        * @method setWorkflowStatus
        * @param newStatus {String} new article workflow status
        */
        $scope.setWorkflowStatus = function (newStatus) {

            $scope.changingWfStatus = true;

            article.setWorkflowStatus(newStatus)
                .then(function () {
                    var statusObj = _.find(
                        $scope.workflowStatuses, {value: newStatus}
                    );
                    $scope.wfStatus = statusObj;
                })
                .finally(function () {
                    $scope.changingWfStatus = false;
                });
        };

        /**
        * Saves article's content to server and clears the article modified
        * flag on success.
        *
        * @method save
        */
        $scope.save = function () {
            // XXX: disable save button during saving? to prevent double
            // saving?
            $scope.articleService.save($scope.article).then(function () {
                $scope.setModified(false);
            });
        };

        /**
        * Updates the article modified flag in article service.
        *
        * @method setModified
        * @param value {Boolean} article modified flag's new value
        */
        $scope.setModified = function (value) {
            $scope.articleService.modified = value;
        };
    }
]);
