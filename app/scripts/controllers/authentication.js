'use strict';
angular.module('authoringEnvironmentApp').controller('AuthenticationCtrl', [
    '$scope',
    '$window',
    '$location',
    '$log',
    function ($scope, $window, $location, $log) {
        $scope.parse = function (s) {
            var withoutSlash = s.slice(1);
            var splitted = withoutSlash.split('&');
            var parsed = {};
            splitted.forEach(function (section) {
                var pair = section.split('=');
                parsed[pair[0]] = pair[1];
            });
            return parsed;
        };
        var url = $location.url();
        var hash = $location.hash();
        $log.debug('location url:', url);
        $log.debug('location hash:', hash);
        var parsed = $scope.parse(url);
        $log.debug('parsed values:', JSON.stringify(parsed));
        if ('access_token' in parsed) {
            $window.sessionStorage.token = parsed.access_token;
            var newUrl = '/';
            $location.url(newUrl);
            $log.debug('redirecting to', newUrl);
        }
    }
]);