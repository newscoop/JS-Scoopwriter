'use strict';

angular.module('authoringEnvironmentApp')
    .controller('ImagePaneCtrl',
                ['$scope', 'images', 'modal', 'article', 'articleType', '$location',
                 function ($scope, images, modal, article, articleType, $location) {
                     $scope.images = images;
                     $scope.attachModal = function() {
                         modal.show({
                             title: 'Attach Image',
                             templateUrl: 'views/attach-image.html'
                         });
                     };
                     $scope.defaultWidth = '300px';
                 }]);
