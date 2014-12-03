'use strict';

angular.module('authoringEnvironmentApp').

controller('MainCtrl', [
        '$scope',
        '$window',
        'mode',
        'userAuth',
        function ($scope, $window, mode, userAuth) {
            if (!userAuth.isAuthenticated()) {
                $scope.auth = false;

                var promise = userAuth.newTokenByLoginModal();

                promise.then(function(token) {
                    $scope.auth = true;
                })
                .catch(function () {
                    // XXX: show toast message?
                });
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
