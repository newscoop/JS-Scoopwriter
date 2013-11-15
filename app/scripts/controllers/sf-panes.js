'use strict';

angular.module('authoringEnvironmentApp')
  .controller('SfPanesCtrl', function ($scope, $filter) {
    $scope.panes = [
        {name: "Topics", template: 'views/pane-topics.html', position: 'left', active: false, selected: true},
        {name: "Koekjes", template: 'views/pane-topics.html', position: 'left', active: false, selected: true},
        {name: "Media", template: 'views/pane-topics.html', position: 'right', active: false, selected: true}
    ];

    $scope.tabpaneIsOpen = function(side) {
        if ($filter('filter')($scope.panes, {position:side, selected: true, active:true}).length > 0) {
            return true;
        } else {
            return false
        }
    }

    $scope.flipActive = function(pane, side) {
        angular.forEach($filter('filter')($scope.panes, {position:side, selected: true, active:true}), function(value, key) {
            if (value != pane) {
                value.active = false;
            }
        });
        pane.active = !pane.active;
    }
  });
