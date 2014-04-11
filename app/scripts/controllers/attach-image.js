'use strict';

/**
* AngularJS controller for a modal in which user can attach images
* to an article.
*
* @class AttachImageCtrl
*/
angular.module('authoringEnvironmentApp').controller('AttachImageCtrl', [
    '$scope',
    'images',
    'imageUploading',
    'modal',
    'configuration',
    function ($scope, images, imageUploading, modal, configuration) {

        $scope.root = configuration.API.rootURI;
        $scope.images = images;

        $scope.sources = [
            {
                value: 'computer',
                url: 'views/attach-image/computer.html',
                description: 'From Computer'
            },
            /* {
                value: 'web',
                url: 'views/attach-image/web.html',
                description: 'From Web'
            }, */
            {
                value: 'archive',
                url: 'views/attach-image/archive.html',
                description: 'From Media Archive'
            }
        ];

        $scope.selected = $scope.sources[1];

        $scope.select = function (source) {
            $scope.selected = source;
        };

        $scope.attached = function (files) {
            imageUploading.init(files);
            modal.show({
                title: 'Image Upload',
                templateUrl: 'views/image-uploading.html'
            });
        };

    }
]);
