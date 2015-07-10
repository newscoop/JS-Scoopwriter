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
    '$window',
    'article',
    'Article',
    'mode',
    'toaster',
    'TranslationService',
    'pageHelper',
    function (
        $rootScope, $scope, $window, articleService, Article, mode, toaster,
        TranslationService, pageHelper
    ) {
        var statusObj;

        $scope.mode = mode;
        $scope.articleService = articleService;
        $scope.article = articleService.articleInstance;
        $scope.Article = Article;

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
            var reactOnTypes = {
                'keypress': true,
                'paste': true,
                'idle': true,
                'undo': true,
                'redo': true
            };

            if (!(alohaEditable.triggerType in reactOnTypes)) {
                // drag and drop change will not have a triggerType
                // and we want them to enable the save button
                if (alohaEditable.triggerType) {
                    return;
                }
            }

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
        * Releases the lock on article and closes the article edit screen
        * (redirecting user to the list of articles).
        *
        * @method close
        */
        $scope.close = function () {
            var redirectUrl = [
                AES_SETTINGS.API.rootURI, '/',
                'admin/articles/index.php?',
                'f_publication_id=', $scope.article.publication.id,
                '&f_issue_number=', $scope.article.issue.number,
                '&f_language_id=', $scope.article.languageData.id,
                '&f_section_number=', $scope.article.section.number
            ].join('');

            $scope.article.releaseLock()
            .then(function () {
                $window.location.href = redirectUrl;
            })
            .catch(function () {
                toaster.add({
                    type: 'sf-error',
                    message: 'Unlocking the article failed.'
                });
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
                pageHelper.populateHeaderTitle();
                toaster.add({
                    type: 'sf-info',
                    message: TranslationService.trans(
                        'aes.alerts.saved'
                    )
                });
            }, function () {
                toaster.add({
                    type: 'sf-error',
                    message: TranslationService.trans(
                        'aes.alerts.save.error'
                    )
                });
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
