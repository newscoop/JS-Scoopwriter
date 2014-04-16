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

        // add new images to the list of images to upload
        // TODO: docstring and tests
        $scope.addToUploadList = function (newImages) {
            images.addToUploadList(newImages);
            $scope.$apply();
        };

    }
]);
