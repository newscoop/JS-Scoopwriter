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
                $scope.newCaption = image.description;
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

        /**
        * Activates the editing image caption mode.
        *
        * @method editCaptionMode
        * @param enabled {Boolean} whether to enable the mode or not
        */
        $scope.editCaptionMode = function (enabled) {
            $scope.editingCaption = enabled;
        };

        /**
        * Updates image's caption on the server and exits the editing
        * caption mode.
        *
        * @method updateCaption
        */
        $scope.updateCaption = function () {
            $scope.editingCaption = false;

            $scope.image.updateDescription($scope.newCaption)
            .catch(function () {
                $scope.newCaption = $scope.image.description;
            });

            // TODO: somehow notify images pane on success!
        };

        $scope.editingCaption = false;
        $scope.newCaption = '';  // temp value of image's new description

        $scope.root = configuration.API.rootURI;
        $scope.images = images;
    }
]);