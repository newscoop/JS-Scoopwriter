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

                //var promise = userAuth.obtainNewToken(true);
                // TODO: revert back to obtainNewToken() modal
                var promise = userAuth.newTokenByLoginModal();

                promise.then(function(token) {
                    console.debug('mainCtrl: obtaining token succeeded');
                    $scope.auth = true;
                })
                .catch(function () {
                    console.debug('mainCtrl: obtaining token failed');
                    // TODO: show toast message?
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
