/* global CSClientId */

(function () {
    'use strict';

    // TODO: also move authInterceptor interceptor here?

    /**
    * Constructor function for the login modal controller
    *
    * @class ModalLoginCtrl
    */
    // TODO: tests
    function ModalLoginCtrl($modalInstance, userAuth) {
        var self = this;

        self.formData = {};
        self.errorMsg = '';

        /**
        * Form submit handler. Tries to login user and, if successful, closes
        * the modal, otherwise displays a failed login message.
        *
        * @method submit
        */
        self.submit = function () {
            self.errorMsg = 'Authenticating...';

            userAuth.loginUser(
                self.formData.username, self.formData.password
            )
            .then(function () {
                $modalInstance.close();
            })
            .catch(function () {
                self.formData.password = '';
                self.errorMsg =
                    'Login failed, please check your username/password.';
            });
        };

        // XXX: add a way to close the modal without logging in?
        // in this case call $modalInstance.dismiss();
        // Other parts of the application should then display some
        // "not logged in" toast message, informing the user that action that
        // triggered the modal opening failed (e.g. saving the article)
    }

    ModalLoginCtrl.$inject = ['$modalInstance', 'userAuth'];


    /**
    * A service for managing user authentication.
    *
    * @class userAuth
    */
    // TODO: comments, tests
    angular.module('authoringEnvironmentApp').service('userAuth', [
        '$http',
        '$modal',
        '$q',
        '$window',
        function ($http, $modal, $q, $window) {
            var self = this;

            self.token = function () {
                return $window.sessionStorage.token;
            };

            self.isAuthenticated = function () {
                return !!$window.sessionStorage.token;
            };

            self.obtainNewToken = function (addRequestMarker) {
                var deferredGet = $q.defer(),
                    requestConfig = {},
                    url;

                addRequestMarker = !!addRequestMarker;
                // XXX: should this marker be always set? probably!
                // remove parameter then ...

                url = Routing.generate(
                    'newscoop_gimme_users_getuseraccesstoken',
                    {'clientId': CSClientId}, true
                );

                if (addRequestMarker) {
                    // mark this request for a token with a special marker
                    // so that response interceptor can recognize it
                    requestConfig._NEW_TOKEN_REQ_ = true;
                }

                $http.get(url, requestConfig)
                .success(function (response) {
                    $window.sessionStorage.token = response.access_token;
                    deferredGet.resolve(response.access_token);
                }).error(function (response) {
                    deferredGet.reject(response);
                });

                return deferredGet.promise;
            };

            self.newTokenByLoginModal = function () {
                var deferred = $q.defer();

                console.debug('inside of newTokenByLoginModal() method');

                var dialog = $modal.open({
                    templateUrl: 'views/modal-login.html',
                    controller: ModalLoginCtrl,
                    controllerAs: 'ctrl',
                    windowClass: 'modalLogin',
                    backdrop: 'static'
                });

                dialog.result.then(function () {
                    console.debug('uAuth: login through modal success',
                        'will obtain new token');
                    return self.obtainNewToken();
                }, function (reason) {
                    // login failed
                    console.debug('uAuth: login through modal failed');
                    deferred.reject(reason);
                })
                .then(function (authToken) {
                    console.debug('uAuth: re-obtaining token success!');
                    deferred.resolve(authToken);
                })
                .catch(function (reason) {
                    // re-obtaining token failed
                    console.debug('uAuth: re-obtaining token failed');
                    deferred.reject(reason);
                });

                return deferred.promise;
            };

            self.loginUser = function (username, password) {
                var deferredLogin = $q.defer(),
                    requestConfig = {},
                    url;

                url = Routing.generate(
                    'newscoop_gimme_users_login',
                    {username: username, password:password},
                    true
                );

                $http.post(url, {})
                .success(function (response) {
                    deferredLogin.resolve();
                }).error(function (response) {
                    deferredLogin.reject();
                });

                return deferredLogin.promise;
            };
        }
    ]);

}());
