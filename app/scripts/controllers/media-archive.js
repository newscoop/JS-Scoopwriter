'use strict';

/**
* AngularJS controller for managing media archive.
*
* @class MediaArchiveCtrl
*/
angular.module('authoringEnvironmentApp').controller('MediaArchiveCtrl', [
    '$scope',
    'images',
    'configuration',
    function ($scope, images, conf) {
        $scope.images = images;
        $scope.root = conf.API.rootURI;
        images.init();

        /**
        * Event handler for clicking a thumbnail. If the image is not attached
        * to the article and not in the basket (not collected), it is added
        * to the basket, otherwise nothing happens.
        *
        * @method thumbnailClicked
        * @param imageId {Number} ID of the clicked image
        */
        $scope.thumbnailClicked = function (imageId) {
            var isAttached = images.isAttached(imageId),
                isCollected = images.isCollected(imageId);

            if (isAttached || isCollected) {
                return;
            } else {
                images.toggleCollect(imageId);
            }
        };
    }
]);