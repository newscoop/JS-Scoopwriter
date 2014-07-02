'use strict';
angular.module('authoringEnvironmentApp').controller('DroppedImageCtrl', [
    'images',
    '$scope',
    'configuration',
    'NcImage',
    function (images, $scope, configuration, NcImage) {
        var self = this;

        /**
        * Initializes the controller - it retrieves the specified image from
        * the server.
        *
        * @method init
        * @param imageId {Number} ID of the image to retrieve
        */
        this.init = function (imageId) {
            NcImage.getById(imageId).then(function (image) {
                $scope.image = image;
            });
        };

        this.imageRemoved = function (imageId) {
            console.log('Image', self.imageId, 'removed from article body');
        };

        $scope.root = configuration.API.rootURI;
        $scope.images = images;
    }
]);