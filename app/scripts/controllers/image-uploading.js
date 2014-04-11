'use strict';

angular.module('authoringEnvironmentApp').controller('ImageUploadingCtrl', [
    '$scope',
    'imageUploading',
    '$upload',
    'imageResource',
    'configuration',
    'getFileReader',
    'transform',
    '$log',
    function (
        $scope, imageUploading, $upload, imageResource, configuration,
        getFileReader, transform, $log
    ) {

        var root = configuration.API.full;
        $scope.imageUploading = imageUploading;

        function initialise() {
            $scope.files = imageUploading.get().map(decorate);
            $scope.files.forEach(function(file) {
                file.startUpload();
            });
        }

        initialise();

        function decorate(file) {

            file.progressCallback = function(event) {
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
                    $upload
                        .http({
                            url: root + '/images',
                            method: 'POST',
                            data: transform.formEncodeData(data)
                        })
                        .progress(file.progressCallback)
                        .success(function(data, status, headers, config) {
                            file.progressCallback({
                                loaded: 100,
                                total:  100
                            });
                        });
                };
                reader.readAsBinaryString(this);
            };

            return file;
        }

    }
]);
