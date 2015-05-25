'use strict';

angular.module('authoringEnvironmentApp').

controller('MainCtrl', [
        '$scope',
        '$window',
        'mode',
        'userAuth',
        'toaster',
        function ($scope, $window, mode, userAuth, toaster) {
            if (!userAuth.isAuthenticated()) {
                $scope.auth = false;

                var promise = userAuth.obtainToken();

                promise.then(function(token) {
                    $scope.auth = true;
                })
                .catch(function () {
                    var promise = userAuth.newTokenByLoginModal();
                    promise.then(function(token) {
                        $scope.auth = true;
                    })
                    .catch(function () {
                        toaster.add({
                            type: 'sf-error',
                            message: 'Could not get access token. ' +
                            'Check AES_SETTINGS.auth config.'
                        });
                    });
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
