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
            'http://newscoop.aes.sourcefabric.net',
            '/admin/image/article',
            '/article_number/', articleInfo.articleId,
            '/language_id/5'
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
    .controller('RenditionsEditorCtrl', [
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
            self.openRenditionsEditor = function () {
                $modal.open({
                    templateUrl: 'views/modal-renditions-editor.html',
                    controller: ModalCtrl,
                    controllerAs: 'modalRenditionsCtrl',
                    windowClass: 'renditionsModal',
                    resolve: {
                        articleInfo: function () {
                            // TODO: add real languageId when available
                            return {
                                articleId: article.articleId,
                                languageId: 5
                            };
                        }
                    }
                });
            };
        }
    ]);

}());
