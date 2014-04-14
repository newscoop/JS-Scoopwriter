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

            file.startUpload = function() {
                var reader = getFileReader.get();

                reader.onload = function(evt) {
                    var data = {
                        image: {
                            image: evt.target.result
                        }
                    };

                    // TODO: display image thumbnail data as a preview?
                    // in image uploading box? nekako nastavi file.rawData,
                    // pa to v template-u daj kot img ng-src="rawData"
                    //  (z inline data)

                    // "When the load finishes, the reader's onload event is
                    // fired and its result attribute can be used to access
                    // the file data"

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

                    // XXX: add onerror handler?
                };

                reader.readAsBinaryString(this);
            };

            return file;
        }

    }
]);
