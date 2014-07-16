'use strict';

/**
* AngularJS controller for the Images pane.
* not individual comments).
*
* @class ImagePaneCtrl
*/
angular.module('authoringEnvironmentApp').controller('ImagePaneCtrl', [
    '$scope',
    'images',
    'modal',  // XXX: later move this old modal service into modalFactory
    'modalFactory',
    'article',
    'articleType',
    '$location',
    'configuration',
    function (
        $scope, images, modal, modalFactory, article, articleType,
        $location, conf
    ) {

        $scope.images = images;
        $scope.defaultWidth = '100%';
        $scope.root = conf.API.rootURI;

        /**
        * Opens a modal containing an interface for attaching
        * images to article.
        *
        * @method attachModal
        */
        $scope.attachModal = function () {
            modal.show({
                title: 'Attach Image',
                templateUrl: 'views/attach-image.html'
            });
        };

        /**
        * Determines whether a particular image can be detached from the
        * article. Images can be detached if they are not used in the article
        * body.
        *
        * @method detachingAllowed
        * @param imageId {Number} ID of the image to check
        * @return {Boolean}
        */
        $scope.detachingAllowed = function (imageId) {
            return !images.inArticleBody[imageId];
        };

        /**
        * Asks user to confirm detaching an image from the article (by
        * displaying a modal) and then, if the action is confirmed,
        * detaches the image.
        *
        * @method detachImage
        * @param imageId {Number} ID of the image to detach
        */
        $scope.detachImage = function (imageId) {
            var modal,
                title,
                text;

            title = 'Do you really want to detach this image from ' +
                'the article?';
            text = 'Should you change your mind, the image can ' +
                'always be re-attached again.';

            modal = modalFactory.confirmLight(title, text);

            modal.result.then(function (data) {
                images.detach(imageId);
            }, function (reason) {
                // action canceled, do nothing
            });
        };
    }
]);