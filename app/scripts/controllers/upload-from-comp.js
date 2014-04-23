'use strict';

/**
* AngularJS controller for managing image uploads from a computer.
*
* @class UploadFromCompCtrl
*/
angular.module('authoringEnvironmentApp').controller('UploadFromCompCtrl', [
    '$scope',
    'images',
    function ($scope, images) {

        $scope.images2upload = images.images2upload;

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
        // TODO: tests
        $scope.addToUploadList = function (newImages) {
            images.addToUploadList(newImages);
            $scope.$apply();
        };

    }
]);
