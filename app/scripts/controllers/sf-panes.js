'use strict';

angular.module('authoringEnvironmentApp').controller('SfPanesCtrl',
    function ($scope, $filter, panes) {
        $scope.panes = panes.query();
        $scope.tabpaneIsOpen = function (side) {
            return $filter('filter')($scope.panes, {
                position: side,
                selected: true,
                visible: true
            }).length > 0;
        };
        $scope.flipVisible = function (pane) {
            panes.visible(pane);
            pane.active = true;
        };
    }
);
