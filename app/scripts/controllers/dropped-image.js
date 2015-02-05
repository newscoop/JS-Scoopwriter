'use strict';
angular.module('authoringEnvironmentApp').controller('DroppedImageCtrl', [
    'images',
    '$scope',
    'NcImage',
    '$rootScope',
    '$q',
    function (images, $scope, NcImage, $rootScope, $q) {

        /**
        * Initializes the controller - it finds the specified image in the
        * list of images attached to the article and adds it to
        * the images-in-article list.
        *
        * @method init
        * @param articleImageId {Number} ID of the (imageId, articleId) pair
        *   (the pair denotes that a particluar image is attached to
        *    a particular article)
        */
        this.init = function (articleImageId) {
console.log('controller.init', articleImageId);
            var deferred = $q.defer();

            images.attachedLoaded.then(function () {
                $scope.image = images.byArticleImageId(articleImageId);
                images.addToIncluded($scope.image.id);
                $scope.newCaption = $scope.image.description;

                deferred.resolve($scope.image);
            });

            return deferred.promise;
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
            if (enabled) {
                $scope.newCaption = $scope.image.description;
            }
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
        };

        $scope.editingCaption = false;
        $scope.newCaption = '';  // temp value of image's new description

        $scope.root = AES_SETTINGS.API.rootURI;
        $scope.images = images;
    }
]);
