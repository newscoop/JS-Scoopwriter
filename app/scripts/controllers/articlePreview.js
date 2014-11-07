(function () {
    'use strict';

    /**
    * Constructor function for the article preview modal controller.
    *
    * @class ModalCtrl
    */
    function ModalCtrl(
        $sce, $scope, $modalInstance, articleInfo, configuration
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
        * @method close
        */
        self.close = function () {
            $modalInstance.close();
        };
    }

    ModalCtrl.$inject = [
        '$sce', '$scope', '$modalInstance', 'articleInfo', 'configuration'
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

            // TODO: need to wait until the article is loaded...
            // article.promise.then
            self.openPreview = function () {
                $modal.open({
                    templateUrl: 'views/modal-article-preview.html',
                    controller: ModalCtrl,
                    controllerAs: 'modalPreviewCtrl',
                    resolve: {
                        articleInfo: function () {
                            // TODO: feed real data
                            return {
                                articleId: 533522,
                                languageId: 5,
                                publicationId: 1,
                                issueId: 119,
                                sectionId: 10
                            };
                        },
                    }
                });
            };
        }
    ]);

}());
