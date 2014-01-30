'use strict';

angular.module('authoringEnvironmentApp')
    .controller('AttachImageCtrl', ['$scope', function ($scope) {
        $scope.sources = [{
            value: 'computer',
            url: 'views/attach-image/computer.html',
            description: 'From Computer'
        }, {
            value: 'web',
            url: 'views/attach-image/web.html',
            description: 'From Web'
        }, {
            value: 'archive',
            url: 'views/attach-image/archive.html',
            description: 'From Media Archive'
        }];
        $scope.selected = $scope.sources[2];
        $scope.select = function(source) {
            $scope.selected = source;
        };
    }]);
