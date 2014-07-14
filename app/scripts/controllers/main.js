'use strict';
angular.module('authoringEnvironmentApp').

controller('MainCtrl', [
        '$scope',
        '$window',
        'mode',
        'UserAuth',
        function ($scope, $window, mode, UserAuth) {
            console.log(UserAuth.getToken(CSClientId));
            $scope.$on('$viewContentLoaded', function () {
                jQuery('#cs-specific').prependTo('.main-background-container');
            });
            $scope.mode = mode;
        }
    ]
);
