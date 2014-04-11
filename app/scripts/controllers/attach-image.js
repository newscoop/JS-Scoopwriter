'use strict';

// angular.module('authoringEnvironmentApp').controller('AttachImageCtrl', [
//     '$scope',
//     'images',
//     'configuration',
//     function ($scope, images, configuration) {
//         $scope.root = configuration.API.rootURI;
//         $scope.images = images;
//         $scope.sources = [
//             {
//                 value: 'computer',
//                 url: 'views/attach-image/computer.html',
//                 description: 'From Computer'
//             },
//             {
//                 value: 'archive',
//                 url: 'views/attach-image/archive.html',
//                 description: 'From Media Archive'
//             }
//         ];

angular.module('authoringEnvironmentApp').controller('AttachImageCtrl', [
    '$scope',
    'imageUploading',
    'modal',
    function ($scope, imageUploading, modal) {

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
