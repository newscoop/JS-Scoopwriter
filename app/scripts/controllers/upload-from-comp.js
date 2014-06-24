'use strict';

/**
* AngularJS controller for managing image uploads from a computer.
*
* @class UploadFromCompCtrl
*/
angular.module('authoringEnvironmentApp').controller('UploadFromCompCtrl', [
    '$scope',
    'images',
    '$q',
    function ($scope, images, $q) {

        $scope.images2upload = images.images2upload;
        $scope.uploading = false;

        $scope.$watchCollection(
            'images.images2upload',
            function (newVal, oldVal) {
                $scope.images2upload = newVal;
            }
        );

        /**
        * Adds new images to the list of images to upload.
        *
        * @method addToUploadList
        * @param newImages {Object} array of images to add to the upload list
        */
        $scope.addToUploadList = function (newImages) {
            images.addToUploadList(newImages);
            $scope.$apply();
        };

        /**
        * Removes image from the upload staging panel.
        *
        * @method removeFromStaging
        * @param image {Object} image to remove
        */
        $scope.removeFromStaging = function (image) {
            images.removeFromUploadList(image);
        };

        /**
        * Triggers uploading of all the images in the images2upload list and
        * clearing the list when done.
        *
        * @method uploadStaged
        */
        $scope.uploadStaged = function () {
            var uploadPromises;

            $scope.uploading = true;
            uploadPromises = images.uploadAll();

            $q.all(uploadPromises).then(function (data) {

                data.forEach(function (imageInfo) {
                    images.collect(imageInfo.id, true);
                });

                images.clearUploadList();
            }).finally(function () {
                $scope.uploading = false;
            });
        };

        /**
        * Triggers clearing the list of images to upload.
        *
        * @method clearStaged
        */
        $scope.clearStaged = function () {
            images.clearUploadList();
        };

        /**
        * Sets given photographer name for all images in staging area.
        *
        * @method setForAllPhotographer
        * @param photographer {String} photographer name to set
        */
        $scope.setForAllPhotographer = function (photographer) {
            images.images2upload.forEach(function (item) {
                item.photographer = photographer;
            });
        };

        /**
        * Sets given description for all images in staging area.
        *
        * @method setForAllDescription
        * @param description {String} image description to set
        */
        $scope.setForAllDescription = function (description) {
            images.images2upload.forEach(function (item) {
                item.description = description;
            });
        };
    }
]);
