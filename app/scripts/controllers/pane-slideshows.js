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
            AES_SETTINGS.API.rootURI,
            '/admin/slideshow/create',
            '/article_number/', articleInfo.articleId
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
    * AngularJS controller for displaying a modal containing renditions editor.
    *
    * @class RenditionsEditorCtrl
    */
    angular.module('authoringEnvironmentApp')
    .controller('SlideshowsCtrl', [
        '$modal',
        'article',
        function ($modal, articleService) {
            var article = articleService.articleInstance,
                self = this;

            /**
            * Opens a modal containing the renditions editor.
            *
            * @method openRenditionsEditor
            */
            self.openSlideshowsEditor = function () {
                $modal.open({
                    templateUrl: 'views/modal-slideshows-editor.html',
                    controller: ModalCtrl,
                    controllerAs: 'modalSlideshowsCtrl',
                    windowClass: 'slideshowsModal',
                    resolve: {
                        articleInfo: function () {
                            return {
                                articleId: article.articleId,
                                languageId: article.languageData.id
                            };
                        }
                    }
                });
            };
        }
    ]);

}());
