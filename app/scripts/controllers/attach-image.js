'use strict';
angular.module('authoringEnvironmentApp').controller('AttachImageCtrl', [
    '$scope',
    'images',
    'configuration',
    function ($scope, images, configuration) {
        $scope.root = configuration.API.rootURI;
        $scope.images = images;
        $scope.sources = [
            {
                value: 'computer',
                url: 'views/attach-image/computer.html',
                description: 'From Computer'
            },
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
    }
]);