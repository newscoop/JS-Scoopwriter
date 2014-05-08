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

        // TODO: comments and tests
        $scope.searchFilter = '';

        // TODO: and tests (correctly updating it)
        $scope.$watch('images.searchFilter', function (newVal, oldVal) {
            $scope.appliedFilter = newVal;
        });

        // TODO: also add search result count and dynamically hide
        // "load more" button

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

        // TODO: comments and tests
        $scope.searchArchive = function (searchFilter) {
            images.query(searchFilter);
        };

        // TODO: comments and tests
        $scope.loadMore = function () {
            images.more();
        };
    }
]);