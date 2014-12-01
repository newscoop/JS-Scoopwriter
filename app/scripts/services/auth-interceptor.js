'use strict';

/**
* AngularJS Service for intercepting API requests and adding authorization
* info to them.
*
* @class authInterceptor
*/
angular.module('authoringEnvironmentApp').factory('authInterceptor', [
    '$injector',
    '$q',
    '$window',
    function ($injector, $q, $window) {
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
            },

            // TODO: extensive comments on how this works (tokens, logins etc.)
            responseError: function (response) {
                // TODO: explain that this is used for avoiding
                // cricular dependency
                var userAuth = $injector.get('userAuth');

                var lastRequestConfig = response.config;

                if (response.status !== 401) {
                    // general non-authentication error occured, we don't
                    // handle this here
                    console.debug('--- itc: general non-authentication err.');
                    return $q.reject(response);
                }

                if (response.config.IS_RETRY) {
                    console.debug('--- itc: retry failed, aborting');

                    // delete response.config.IS_RETRY;
                    return $q.reject(response);
                }

                if (response.status === 401 ||
                    response.statusText === 'OAuth2 authentication required') {
                    // oAuth token expired, obtain a new one and then repeat
                    // the last  request on success

                    var retryDeferred = $q.defer();

                    console.debug('--- itc: token is not valid,',
                        'will obtain a new one');

                    // 1. request a token
                    userAuth.newTokenByLoginModal()
                    .then(function () {
                        // success, successful repeat the last request
                        // you have response.config for that
                        console.debug('--- itc: re-login w/ modal success');
                        //debugger;

                        // TODO:return success promise or what?
                        var $http = $injector.get('$http');
                        var configToRepeat = angular.copy(response.config);

                        configToRepeat.IS_RETRY = true;
                        console.debug('--- itc: repeating request', configToRepeat);
                        $http(configToRepeat)
                        .success(function () {
                            retryDeferred.resolve(response);
                        })
                        .error(function () {
                            retryDeferred.reject(response);
                        });
                    })
                    .catch(function () {
                        // TODO: obtaining new token failed,
                        // show modal dialog to login and then, if login
                        // success, repeat the last request

                        // XXX: 
                        console.debug('--- itc: re-login w/ modal failed');
                        // debugger;
                        retryDeferred.reject(response);
                    });

                    // TODO: return my own promise
                    return retryDeferred.promise
                }
            }
        };
    }
]);
