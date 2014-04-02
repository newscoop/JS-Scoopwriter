'use strict';
angular.module('authoringEnvironmentApp').controller('ImagePaneCtrl', [
    '$scope',
    'images',
    'modal',
    'article',
    'articleType',
    '$location',
    'configuration',
    function ($scope, images, modal, article, articleType, $location, conf) {
        $scope.images = images;
        $scope.attachModal = function () {
            modal.show({
                title: 'Attach Image',
                templateUrl: 'views/attach-image.html'
            });
        };
        $scope.defaultWidth = '100%';
        $scope.root = conf.API.rootURI;
    }
]);