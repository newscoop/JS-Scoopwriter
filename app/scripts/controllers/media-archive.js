'use strict';

angular.module('authoringEnvironmentApp')
    .controller('MediaArchiveCtrl', ['$scope', 'images', 'endpoint', function ($scope, images, endpoint) {
        $scope.images = images;
        $scope.endpoint = endpoint;
        images.init();
    }]);
