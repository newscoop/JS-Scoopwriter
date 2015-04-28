'use strict';

/**
* AngularJS controller for the Slideshows pane.
*
* @class PaneSlideshowsCtrl
*/
angular.module('authoringEnvironmentApp').controller('PaneSlideshowsCtrl', [
    '$q',
    'article',
    'modalFactory',
    'Slideshow',
    'toaster',
    '$scope',
    'TranslationService',
    function (
        $q,
        articleService,
        modalFactory,
        Slideshow,
        toaster,
        $scope,
        TranslationService) {
        var article = articleService.articleInstance,
            self = this;

        // retrieve all slideshows assigned to the article
        self.assignedSlideshows = Slideshow.getAllByArticle(
            article.articleId, article.language
        );

        $scope.$on('close-slideshow-modal', function(event) {
            self.assignedSlideshows = Slideshow.getAllByArticle(
                article.articleId, article.language
            );
        });

        /**
        * Asks user to confirm unassigning slideshow from the article and then
        * unassignes the slideshow, if the action is confirmed.
        *
        * @method confirmUnassignSlideshow
        * @param slideshow {Object} slideshow to unassign
        */
        self.confirmUnassignSlideshow = function (slideshow) {
            var modal,
                title,
                text;

            title = TranslationService.trans(
                'aes.msgs.slideshows.unassign.popupHead'
            );
            text = TranslationService.trans(
                'aes.msgs.slideshows.unassign.popup'
            );

            modal = modalFactory.confirmLight(title, text);

            modal.result.then(function () {
                return slideshow.removeFromArticle(
                        article.articleId, article.language
                    ).then(function () {
                        _.remove(self.assignedSlideshows, {id: slideshow.id});
                        toaster.add({
                            type: 'sf-info',
                            message: TranslationService.trans(
                                'aes.msgs.slideshows.unassign.success'
                            )
                        });
                    }, function () {
                        toaster.add({
                            type: 'sf-error',
                            message: TranslationService.trans(
                                'aes.msgs.slideshows.unassign.error'
                            )
                        });
                    });
            }, $q.reject);
        };
    }
]);
