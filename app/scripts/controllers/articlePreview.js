(function () {
    'use strict';

    /**
    * Constructor function for the article preview modal controller.
    *
    * @class ModalCtrl
    */
    function ModalCtrl($modalInstance, $sce, articleInfo) {
        var self = this,
            url;

        url = [
            AES_SETTINGS.API.rootURI, '/admin/articles/preview.php?',
            'f_publication_id=', articleInfo.publicationId,
            '&f_issue_number=', articleInfo.issueId,
            '&f_section_number=', articleInfo.sectionId,
            '&f_article_number=', articleInfo.articleId,
            '&f_language_id=', articleInfo.languageId,
            '&f_language_selected=', articleInfo.languageId
        ].join('');

        self.url = $sce.trustAsResourceUrl(url);

        /**
        * Closes the modal.
        *
        * @method close
        */
        self.close = function () {
            $modalInstance.close();
        };
    }

    ModalCtrl.$inject = ['$modalInstance', '$sce', 'articleInfo'];


    /**
    * AngularJS controller for displaying a modal containing article preview.
    *
    * @class ArticlePreviewCtrl
    */
    angular.module('authoringEnvironmentApp')
    .controller('ArticlePreviewCtrl', [
        '$modal',
        '$window',
        'article',
        function ($modal, $window, articleService) {
            var self = this;

            self.article = articleService.articleInstance;

            /**
            * Opens the live view of the article in a 
            * new window.
            *
            * @method openLiveView
            */
            self.openLiveView = function () {
                $window.open(articleService.articleInstance.url);
            };

            /**
            * Opens the article preview modal, providing article data to it.
            *
            * @method openPreview
            */
            self.openPreview = function () {
                $modal.open({
                    templateUrl: 'views/modal-article-preview.html',
                    controller: ModalCtrl,
                    controllerAs: 'modalPreviewCtrl',
                    windowClass: 'modalPreview',
                    resolve: {
                        articleInfo: function () {
                            return {
                                articleId: self.article.articleId,
                                languageId: self.article.languageData.id,
                                publicationId: self.article.publication.id,
                                issueId: self.article.issue.number,
                                sectionId: self.article.section.number
                            };
                        }
                    }
                });
            };
        }
    ]);

}());
