'use strict';

/**
* AngularJS controller for managing image uploads from a computer.
*
* @class UploadFromCompCtrl
*/
angular.module('authoringEnvironmentApp').controller('UploadFromCompCtrl', [
    '$scope',
    '$upload',
    'images',
    'configuration',
    'getFileReader',
    'transform',
    function (
        $scope, $upload, images, configuration, getFileReader, transform
    ) {

        var apiRoot = configuration.API.full;

        $scope.images2upload = [];

        // add new files to the list of files to upload
        // TODO: docstring and tests
        $scope.uploadImages = function (newImages) {
            var i,
                newImage;

            for(i = 0; i < newImages.length; i++) {
                newImage = decorate(newImages.item(i));
                $scope.images2upload.push(newImage);
                newImage.startUpload();
            }
        };


        // TODO: docstring and tests
        function decorate(file) {

            file.progressCallback = function (event) {
                file.progress = event.loaded;
                file.max = event.total;
                file.percent =
                    Math.round((event.loaded / event.total) * 100) + '%';
            };

            file.startUpload = function() {
                var reader = getFileReader.get();

                reader.onload = function(evt) {
                    var data = {
                        image: {
                            image: evt.target.result
                        }
                    };

                    $upload.http({
                        url: apiRoot + '/images',
                        method: 'POST',
                        data: transform.formEncodeData(data)
                    })
                    .progress(
                        file.progressCallback  // XXX: does not get called
                    )
                    .success(
                        function (data, status, headers, config) {
                            file.progressCallback({
                                loaded: 100,
                                total:  100
                            });
                        }
                    );
                };

                reader.readAsBinaryString(this);
            };

            return file;
        }

    }
]);
