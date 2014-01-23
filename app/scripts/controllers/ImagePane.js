'use strict';

angular.module('authoringEnvironmentApp')
  .controller('ImagePaneCtrl',
              ['$scope', 'images', 'modal',
               function ($scope, images, modal) {
    $scope.images = images;
    $scope.attachModal = function() {
        modal.show({
            title: 'Attach Image',
            templateUrl: 'views/attach-image.html'
        });
    };
  }]);
