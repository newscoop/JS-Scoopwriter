'use strict';
angular.module('authoringEnvironmentApp').controller('ArticleActionsCtrl', [
    '$scope',
    'article',
    'mode',
    '$log',
    function ($scope, article, mode, $log) {

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
            $scope.articleService.save($scope.article).then(function () {
                 // XXX: this is already tracked in article service?
                $scope.setModified(false);
            });
        };

        // wrapper just for testability purposes
        $scope.setModified = function (value) {
            article.modified = value;  // article here is article *service*
        };

        $scope.watchCallback = function (newValue, oldValue) {
            if (angular.equals(newValue, oldValue)) {
                // initialization
                $scope.modified = false;
            } else {
                if (newValue && oldValue) {
                    // modified
                    $scope.setModified(true);
                } else {
                    // used also for testing
                    if (!oldValue) {
                        $log.debug('the old article value is', oldValue);
                    }
                    if (!newValue) {
                        $log.debug('the new article value is', newValue);
                    }
                }
            }
        };

        $scope.$watch('article', $scope.watchCallback, true);

        $scope.articleService.promise.then(function (article) {
            $scope.article = article;
        });
    }
]);
