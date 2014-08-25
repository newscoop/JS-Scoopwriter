'use strict';

/**
* AngularJS Service for intercepting API requests and adding authorization
* info to them.
*
* @class authInterceptor
*/
angular.module('authoringEnvironmentApp').factory('authInterceptor', [
    '$q',
    '$window',
    function ($q, $window) {
        return {
            request: function (config) {
                var endpoint = Routing.generate(
                    'newscoop_gimme_articles_getarticles', {}, false);

                endpoint = endpoint.substring(1, endpoint.lastIndexOf('/'));

                if (config.url.indexOf(endpoint + '/') === -1) {
                    // do not modify the headers of anything else but the API
                    return config;
                }

                config.headers = config.headers || {};

                if ($window.sessionStorage.token) {
                    config.headers.Authorization = 'Bearer ' +
                        $window.sessionStorage.token;
                }

                return config;
            }
        };
    }
]);
