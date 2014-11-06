(function () {
    'use strict';

    /**
    * Constructor function for the article preview modal controller.
    *
    * @class ModalCtrl
    */
    function ModalCtrl($scope, $modalInstance, articleInfo) {
        var self = this;

        self.articleInfo = articleInfo;

        /**
        * Closes the modal.
        * @method close
        */
        self.close = function () {
            $modalInstance.close();
        };
    }

    ModalCtrl.$inject = ['$scope', '$modalInstance', 'articleInfo'];


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
                            return {
                                articleId: article.articleId,
                                language: article.language,
                                foo: 'bar'
                            };
                        },
                    }
                });
            };
        }
    ]);

}());
