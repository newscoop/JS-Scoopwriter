'use strict';
angular.module('authoringEnvironmentApp').controller('MainCtrl', [
    '$scope',
    '$window',
    'mode',
    'configuration',
    function ($scope, $window, mode, configuration) {
        if ('token' in $window.sessionStorage) {
            $scope.$on('$viewContentLoaded', function () {
                jQuery('#cs-specific').prependTo('.main-background-container');
            });
            $scope.mode = mode;
        } else {
            var pars = {
                    client_id: configuration.auth.client_id,
                    redirect_uri: configuration.auth.redirect_uri,
                    response_type: 'token'
                };
            var arr = [];
            var e = encodeURIComponent;
            angular.forEach(pars, function (value, key) {
                arr.push(e(key) + '=' + e(value));
            });
            var href = configuration.auth.server + arr.join('&');
            $window.location.href = href;
        }
    }
]);
