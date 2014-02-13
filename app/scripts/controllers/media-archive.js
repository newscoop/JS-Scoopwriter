'use strict';

angular.module('authoringEnvironmentApp')
    .controller('MediaArchiveCtrl', ['$scope', 'images', 'configuration', function ($scope, images, conf) {
        $scope.images = images;
        $scope.root = conf.API.rootURI;
        images.init();
    }]);
