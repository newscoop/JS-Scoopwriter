'use strict';
angular.module('authoringEnvironmentApp').factory('authInterceptor', [
    '$q',
    '$window',
    'configuration',
    function ($q, $window, configuration) {
        return {
            request: function (config) {
                if (config.url.indexOf(configuration.API.endpoint.substring(1)+'/') === -1) {
                    // do not modify the headers of anything else but the API
                    return config;
                }

                config.headers = config.headers || {};

                if ($window.sessionStorage.token) {
                    config.headers.Authorization = 'Bearer ' + $window.sessionStorage.token;
                }

                return config;
            }
        };
    }
]);
