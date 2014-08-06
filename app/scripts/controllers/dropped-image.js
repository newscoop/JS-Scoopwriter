'use strict';
angular.module('authoringEnvironmentApp').controller('DroppedImageCtrl', [
    'images',
    '$scope',
    'configuration',
    'NcImage',
    '$rootScope',
    function (images, $scope, configuration, NcImage, $rootScope) {

        /**
        * Initializes the controller - it retrieves the specified image from
        * the server and adds it to the images-in-article list.
        *
        * @method init
        * @param imageId {Number} ID of the image to retrieve
        */
        this.init = function (imageId) {
            var promise = NcImage.getById(imageId);

            promise.then(function (image) {
                $scope.image = image;
                images.addToIncluded(image.id);
            });

            return promise;
        };

        /**
        * Removes an image from the images-in-article list.
        *
        * @method imageRemoved
        * @param imageId {Number} ID of the image to retrieve
        */
        this.imageRemoved = function (imageId) {
            images.removeFromIncluded(imageId);
            $rootScope.$apply(images.inArticleBody);
        };

        $scope.root = configuration.API.rootURI;
        $scope.images = images;
    }
]);