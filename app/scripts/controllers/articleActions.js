'use strict';
angular.module('authoringEnvironmentApp').controller('ArticleActionsCtrl', [
    '$scope',
    'article',
    'mode',
    '$log',
    function ($scope, article, mode, $log) {

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
            var statusObj = _.find(
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

        $scope.save = function () {
            // XXX: disable save button during saving? to prevent double
            // saving?
            $scope.articleService.save($scope.article).then(function () {
                $scope.setModified(false);
            });
        };

        // wrapper just for testability purposes
        $scope.setModified = function (value) {
            $scope.articleService.modified = value;
        };

        $scope.articleService.promise.then(function (article) {
            $scope.article = article;
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
                console.log('setting modified to TRUE');
                $scope.setModified(true);
            }, true);
        });
    }
]);
