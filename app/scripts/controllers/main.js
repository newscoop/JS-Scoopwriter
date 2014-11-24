'use strict';
/* global CSClientId */

angular.module('authoringEnvironmentApp').

controller('MainCtrl', [
        '$scope',
        '$window',
        'mode',
        'UserAuth',
        function ($scope, $window, mode, UserAuth) {
            if ($window.sessionStorage.token === undefined) {
                $scope.auth = false;
                var promise = UserAuth.getToken(CSClientId);
                promise.then(function(userAuth) {
                    $window.sessionStorage.token = userAuth.access_token;
                    $scope.auth = true;
                });
                // TODO: and what if obtaining the token fails? login modal
                // should be displayed ...
            } else {
                $scope.auth = true;
            }
            $scope.$on('$viewContentLoaded', function () {
                jQuery('#cs-specific').prependTo('.main-background-container');
            });
            $scope.mode = mode;
        }
    ]
);
