'use strict';

angular.module('authoringEnvironmentApp')
    .controller('FixedImagePlaceholderCtrl', ['$scope', 'images', 'configuration', function ($scope, images, configuration) {
	$scope.root = configuration.API.rootURI;
        $scope.style = {
            opacity: 0
        };
        $scope.onDrop = function(data) {
            var parsed = JSON.parse(data);
            if ('image' == parsed.type) {
                $scope.$apply(function() {
                    $scope.image = images.byId(parsed.id);
                    $scope.style.opacity = 1;
                });
            }
        };
    }]);
