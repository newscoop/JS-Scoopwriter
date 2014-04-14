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
        // filtered list of images (only image files)
        // TODO: docstring and tests
        $scope.uploadImages = function (newImages) {
            var i,
                image;

            for(i = 0; i < newImages.length; i++) {
                image = decorate(newImages[i]);
                $scope.images2upload.push(image);
                image.startUpload();
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

            file.startUpload = function () {
                var fd = new FormData(),
                    fileHandle = this,
                    reader = getFileReader.get();

                fd.append('image[description]', 'this is image description');
                fd.append('image[image]', fileHandle);

                $upload.http({
                    method: 'POST',
                    url: apiRoot + '/images',
                    data: fd,
                    headers: {'Content-Type': undefined},
                    transformRequest: angular.identity
                })
                .progress(
                    file.progressCallback
                )
                .success(
                    function (data, status, headers, config) {
                        file.progressCallback({
                            loaded: 100,
                            total:  100
                        });
                    }
                );  // XXX: add onerror handler?

                // extract image data to show preview immediately
                reader.onload = function (ev) {
                    fileHandle.b64data = btoa(this.result);
                };
                reader.readAsBinaryString(fileHandle);
            };

            return file;
        }

    }
]);
