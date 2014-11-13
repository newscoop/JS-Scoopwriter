'use strict';

/**
* AngularJS controller for managing various actions on the article, e.g.
* changing the article's workflow status.
*
* @class ArticleActionsCtrl
*/
angular.module('authoringEnvironmentApp').controller('ArticleActionsCtrl', [
    '$rootScope',
    '$scope',
    'article',
    'Article',
    'mode',
    function ($rootScope, $scope, articleService, Article, mode) {
        var statusObj;

        $scope.mode = mode;
        $scope.articleService = articleService;
        $scope.article = articleService.articleInstance;

        // list of possible article workflow status options to choose from
        $scope.workflowStatuses = [
            {
                value: Article.wfStatus.NEW,
                text: 'New'
            },
            {
                value: Article.wfStatus.SUBMITTED,
                text: 'Submitted'
            },
            {
                value: Article.wfStatus.PUBLISHED,
                text: 'Published'
            },
            {
                value: Article.wfStatus.PUBLISHED_W_ISS,
                text: 'Published with issue'
            }
        ];

        $scope.changingWfStatus = false;

        // listen for article content changes
        $rootScope.$on('texteditor-content-changed', function (
            eventObj, jqEvent, alohaEditable
        ) {
            var fieldName,
                reactOnTypes = {'keypress': true, 'paste': true, 'idle': true};

            if (!(alohaEditable.triggerType in reactOnTypes)) {
                return;
            }

            fieldName = alohaEditable.editable.originalObj.data('field-name');

            $scope.setModified(true);
        });

        // set workflow status to the actual article's workflow status
        statusObj = _.find(
            $scope.workflowStatuses, {value: $scope.article.status}
        );
        $scope.wfStatus = statusObj;

        /**
        * Changes article's workflow status. It also disables the corresponding
        * dropdown menu until the API request is completed.
        *
        * @method setWorkflowStatus
        * @param newStatus {String} new article workflow status
        */
        $scope.setWorkflowStatus = function (newStatus) {
            $scope.changingWfStatus = true;

            $scope.article.setWorkflowStatus(newStatus)
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
            $scope.article.save().then(function () {
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
