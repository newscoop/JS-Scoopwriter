'use strict';

angular.module('authoringEnvironmentApp')
  .controller('PanesConfigCtrl', function ($scope, panes) {
    $scope.panes = panes.query();

    $scope.flipPosition = function(pane) {
        pane.position = (pane.position == 'left') ? 'right' : 'left';
    }
  });
