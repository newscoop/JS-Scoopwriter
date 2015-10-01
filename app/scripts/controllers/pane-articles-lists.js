(function () {
    'use strict';

    /**
    * Constructor function for the articles lists modal controller.
    *
    * @class ModalCtrl
    */
    function ModalCtrl($modalInstance, $sce, info, $rootScope) {
        var self = this,
            url;

        switch(info.action) {
            case 'edit':
                url = [
                    AES_SETTINGS.API.rootURI,
                    '/admin/playlists/',
                    info.articleId,
                    '/',
                    info.language,
                    '/editor-view/', info.articlesListId
                ].join('');

                break;
            case 'attach':
                url = [
                    AES_SETTINGS.API.rootURI,
                    '/admin/playlists/',
                    info.articleId,
                    '/',
                    info.language,
                    '/editor-view'
                ].join('');

                break;
            default:
                url = '';
        }

        self.url = $sce.trustAsResourceUrl(url);

        /**
        * Closes the modal.
        *
        * @method close
        */
        self.close = function () {
            $rootScope.$broadcast('close-articles-lists-modal');
            $modalInstance.close();
        };
    }

    /**
    * AngularJS controller for the ArticlesLists pane.
    *
    * @class PaneArticlesListsCtrl
    */
    angular.module('authoringEnvironmentApp')
        .controller('PaneArticlesListsCtrl', [
        '$q',
        '$modal',
        '$scope',
        'article',
        'modalFactory',
        'ArticlesList',
        'toaster',
        'TranslationService',
        function (
            $q,
            $modal,
            $scope,
            articleService,
            modalFactory,
            ArticlesList,
            toaster,
            TranslationService) {
            var self = this,
                article = articleService.articleInstance;

            // retrieve all articlesLists assigned to the article
            self.assignedArticlesLists = ArticlesList.getAllByArticle(
                article.articleId, article.language
            );

            $scope.$on('close-articles-lists-modal', function(event) {
                ArticlesList.getAllByArticle(
                    article.articleId, article.language
                ).$promise.then(function (data) {
                    // iterates in reverse,
                    // removes the list from assignedArticlesLists,
                    // if the list doesn't exist in the response data
                    var i = self.assignedArticlesLists.length;
                    while (i--) {
                        if (!_.some(
                            data, {id: self.assignedArticlesLists[i].id}
                        )) {
                            _.remove(
                                self.assignedArticlesLists,
                                {id: self.assignedArticlesLists[i].id}
                            );
                        }
                    }

                    // adds a new list to assignedArticlesLists
                    // if it does't exist already
                    angular.forEach(data, function(value, key) {
                        if (!_.some(
                            self.assignedArticlesLists,
                            {id: value.id}
                        )) {
                            self.assignedArticlesLists.push(value);
                        }
                    });
                });
            });

            /**
            * Open iframe to the articles lists editor in newscoop admin.
            *
            * @method openArticlesListsEditor
            */
            self.openArticlesListsEditor = function (
                action,
                articlesListId
            ) {
                $modal.open({
                    templateUrl: 'views/modal-articles-lists-editor.html',
                    controller: ModalCtrl,
                    controllerAs: 'modalArticlesListsEditorCtrl',
                    windowClass: 'featuredArticlesModal',
                    resolve: {
                        info: function () {
                            return {
                                articleId: article.articleId,
                                language: article.languageData.id,
                                action: action,
                                articlesListId: articlesListId
                            };
                        }
                    }
                });
            };

            /**
            * Asks user to confirm unassigning a articlesList from the article
            * then unassignes the articlesList, if the action is confirmed.
            *
            * @method confirmUnassignArticlesList
            * @param articlesList {Object} articlesList to unassign
            */
            self.confirmUnassignArticlesList = function (articlesList) {
                var modal,
                    title,
                    text;

                title = TranslationService.trans(
                    'aes.msgs.articleslists.unassign.popupHead'
                );
                text = TranslationService.trans(
                    'aes.msgs.articleslists.unassign.popup'
                );

                modal = modalFactory.confirmLight(title, text);

                modal.result.then(function () {
                    return articlesList.removeFromArticle(
                        article.articleId,
                        article.language,
                        articlesList).then(function () {
                            _.remove(
                                self.assignedArticlesLists,
                                {id: articlesList.id}
                            );
                            toaster.add({
                                type: 'sf-info',
                                message: TranslationService.trans(
                                    'aes.msgs.articleslists.unassign.success'
                                )
                            });
                        }, function () {
                            toaster.add({
                                type: 'sf-error',
                                message: TranslationService.trans(
                                    'aes.msgs.articleslists.unassign.error'
                                )
                            });
                        });
                }, $q.reject);
            };
        }
    ]);

}());
