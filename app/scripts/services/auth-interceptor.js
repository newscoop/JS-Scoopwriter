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
                var userAuth = $injector.get('userAuth');

                var lastRequestConfig = response.config;

                if (response.config._NEW_TOKEN_REQ_) {
                    // we requested a new authentication token but that
                    // request failed ---> open a modal or something?
                    console.debug('--- itc: obtaining new token failed',
                        'need to show a login modal');

                    // something like ...userAuth.modalLogin().then(...)
                    var loginDeferred = $q.defer();

                    var modalPromise = userAuth.newTokenByLoginModal();

                    modalPromise.then(function () {
                        console.debug('modalLogin success, what now?',
                            'repeat lastRequestConfig?');
                        loginDeferred.resolve();
                    })
                    .catch(function () {
                        console.debug('--- itc: modalLogin FAIL');
                        // XXX: reject with some other response?
                        // probably with original, right? yes, that's correct
                        loginDeferred.reject(response);
                    });

                    return loginDeferred.promise;
                }

                // TODO: when API is fixed, revert back to checking the
                // status code
                //if (response.status === 401) {
                if (response.statusText === 'OAuth2 authentication required') {
                    // oAuth token expired, obtain a new one and then repeat
                    // the last  request on success

                    console.debug('--- itc: token is not valid,',
                        'will obtain a new one');

                    // 1. request a token
                    return userAuth.obtainNewToken(true)
                    .then(function () {
                        // success, successful repeat the last request
                        // you have response.config for that
                        console.debug('--- itc: re-obtaining token success');
                        debugger;
                        // TODO:return success promise or what?
                    })
                    .catch(function () {
                        // TODO: obtaining new token failed,
                        // show modal dialog to login and then, if login
                        // success, repeat the last request

                        // XXX: 
                        console.debug('--- itc: re-obtaining token failed');
                        debugger;
                        return $q.reject(response);
                    });
                }

                if (response.status !== 401) {
                    // general non-authentication error occured, we don't
                    // handle this here
                    console.debug('--- itc: general non-authentication err.');
                    return $q.reject(response);
                }
            }
        };
    }
]);
