(function () {
    'use strict';

    /**
    * Constructor function for the article preview modal controller.
    *
    * @class ModalCtrl
    */
    function ModalCtrl(
        $modalInstance, $sce, articleInfo, configuration
    ) {
        var self = this,
            url;

        url = [
            configuration.API.rootURI, '/admin/articles/preview.php?',
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

    ModalCtrl.$inject = [
        '$modalInstance', '$sce', 'articleInfo', 'configuration'
    ];


    /**
    * AngularJS controller for displaying a modal containing article preview.
    *
    * @class ArticlePreviewCtrl
    */
    angular.module('authoringEnvironmentApp')
    .controller('ArticlePreviewCtrl', [
        '$modal',
        'article',
        function ($modal, article) {
            var self = this;

            /**
            * Opens the article preview modal.
            *
            * @function openPreviewModal
            * @param articleData {Object} object containing article data
            */
            function openPreviewModal(articleData) {
                $modal.open({
                    templateUrl: 'views/modal-article-preview.html',
                    controller: ModalCtrl,
                    controllerAs: 'modalPreviewCtrl',
                    resolve: {
                        articleInfo: function () {
                            // TODO: add real languageId and publicationId
                            // when available
                            return {
                                articleId: articleData.number,
                                languageId: 5,
                                publicationId: 1,
                                issueId: articleData.issue.number,
                                sectionId: articleData.section.number
                            };
                        }
                    }
                });
            }


            /**
            * Opens the article preview modal, providing article data to it.
            *
            * @method openPreview
            */
            self.openPreview = function () {
                article.promise.then(function (articleData) {
                    openPreviewModal(articleData);
                });
            };
        }
    ]);

}());
