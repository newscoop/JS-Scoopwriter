(function () {
    'use strict';

    /**
    * Constructor function for the article preview modal controller.
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
                    '/admin/slideshow/edit',
                    '/article_number/', info.articleId,
                    '/slideshow/', info.slideshowId
                ].join('');

                break;
            case 'create':
                url = [
                    AES_SETTINGS.API.rootURI,
                    '/admin/slideshow/create',
                    '/article_number/', info.articleId
                ].join('');

                break;
            case 'attach':
                url = [
                    AES_SETTINGS.API.rootURI,
                    '/admin/slideshow/attach',
                    '/article_number/', info.articleId
                ].join('');

                break;
            default:
                url = "";
        }

        self.url = $sce.trustAsResourceUrl(url);

        /**
        * Closes the modal.
        *
        * @method close
        */
        self.close = function () {
            $rootScope.$broadcast('close-slideshow-modal');
            $modalInstance.close();
        };
    }

    ModalCtrl.$inject = ['$modalInstance', '$sce', 'info', '$rootScope'];


    /**
    * AngularJS controller for displaying a modal containing slideshows editor.
    *
    * @class SlideshowsEditorCtrl
    */
    angular.module('authoringEnvironmentApp').controller(
        'SlideshowsEditorCtrl', [
        '$modal',
        'article',
        function ($modal, articleService) {
            var article = articleService.articleInstance,
                self = this;

            /**
            * Opens a modal containing the slideshows editor.
            *
            * @method openSlideshowsEditor
            */
            self.openSlideshowsEditor = function (action, slideshowId) {
                $modal.open({
                    templateUrl: 'views/modal-slideshows-editor.html',
                    controller: ModalCtrl,
                    controllerAs: 'modalSlideshowsEditorCtrl',
                    windowClass: 'renditionsModal',
                    resolve: {
                        info: function () {
                            return {
                                articleId: article.articleId,
                                action: action,
                                slideshowId: slideshowId
                            };
                        }
                    }
                });
            };
        }
    ]);

}());
