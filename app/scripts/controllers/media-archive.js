'use strict';

angular.module('authoringEnvironmentApp')
    .controller('MediaArchiveCtrl', ['$scope', 'images', function ($scope, images) {
        $scope.images = images;
        images.init();
    }]);
