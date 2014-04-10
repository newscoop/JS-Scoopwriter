'use strict';
// http://blog.auth0.com/2014/01/07/angularjs-authentication-with-cookies-vs-token/
angular.module('authoringEnvironmentApp').factory('authInterceptor', [
    '$q',
    '$window',
    'addToUrl',
    function ($q, $window, addToUrl) {
        return {
            request: function (config) {
                if (config.url.indexOf('template/') > -1) {
                    // don't attach auth token to io.bootstrap template
                    //requests
                    return config;
                }

                config.headers = config.headers || {};

                if ($window.sessionStorage.token) {
                    config.url = addToUrl.add({ access_token: $window.sessionStorage.token }, config.url);
                }
                return config;
            }    /*,
            response: function (response) {
                if (response.status === 401) {
                    // handle the case where the user is not authenticated
                }
                return response || $q.when(response);
            }*/
        };
    }
]);