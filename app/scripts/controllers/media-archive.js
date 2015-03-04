'use strict';

/**
* AngularJS controller for managing media archive.
*
* @class MediaArchiveCtrl
*/
angular.module('authoringEnvironmentApp').controller('MediaArchiveCtrl', [
    '$scope',
    'images',
    function ($scope, images) {
        $scope.images = images;
        $scope.root = AES_SETTINGS.API.rootURI;

        $scope.searchFilter = '';  // search term as entered by user

        $scope.$watch('images.searchFilter', function (newVal, oldVal) {
            // the actual search filter that is applied to current search
            // results
            $scope.appliedFilter = newVal;
        });

        /**
        * Reset search results and clear search text field
        *
        * @method clearSearch
        */
        $scope.clearSearch = function () {
            images.searchFilter = '';
            images.query();
        };

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

        /**
        * Event handler for clicking the Search button. If triggers a new
        * media archive search with the given search filter.
        *
        * @method searchArchive
        * @param searchFilter {String} media archive search term
        */
        $scope.searchArchive = function (searchFilter) {
            images.query(searchFilter);
        };

        /**
        * Event handler for clicking the Load More button. It triggers loading
        * the next page of search results.
        *
        * @method loadMore
        */
        $scope.loadMore = function () {
            images.more();
        };
    }
]);
