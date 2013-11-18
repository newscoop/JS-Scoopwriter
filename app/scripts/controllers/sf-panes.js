'use strict';

angular.module('authoringEnvironmentApp')
  .controller('SfPanesCtrl', function ($scope, $filter, panes) {
    $scope.panes = panes.query();

    $scope.tabpaneIsOpen = function(side) {
        return $filter('filter')($scope.panes, {position:side, selected: true, active:true}).length > 0;
    }

    $scope.flipActive = function(pane, side) {
        angular.forEach($filter('filter')($scope.panes, {position:side, selected: true, active:true}), function(value, key) {
            value.active = (value != pane) ? false : value.active;
        });
        pane.active = !pane.active;
    }
  });
