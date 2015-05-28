(function () {
    'use strict';

    /**
    * Constructor function for the login modal controller
    *
    * @class ModalLoginCtrl
    */
    function ModalLoginCtrl($modalInstance, $window) {
        // On successful login, Newscoop login form redirects user to some
        // redirect URL and that URL contains the new authentication token.
        // Upon redirect, the iframe in modal body is reloaded and its
        // Javascript code extracts the token from the URL. On session
        // storage change login modal will be closed.
        angular.element($window).on('storage', function() {
            if ($window.sessionStorage.getItem(
                    AES_SETTINGS.auth.tokenKeyName
                )) {
                $modalInstance.close();
            }
        });
    }

    ModalLoginCtrl.$inject = ['$modalInstance', '$window'];


    /**
    * A service for managing user authentication.
    *
    * @class userAuth
    */
    angular.module('authoringEnvironmentApp').service('userAuth', [
        '$http',
        '$modal',
        '$q',
        '$window',
        'toaster',
        function ($http, $modal, $q, $window, toaster) {
            var self = this;

            /**
            * Returns the current oAuth token in sessionStorage.
            *
            * @method token
            * @return {String} the token itself or null if does not exist
            */
            self.token = function () {
                return $window.sessionStorage.getItem(
                    AES_SETTINGS.auth.tokenKeyName
                );
            };

            /**
            * Returns true if the current user is authenticated (=has a token),
            * otherwise false.
            *
            * @method isAuthenticated
            * @return {Boolean}
            */
            self.isAuthenticated = function () {
                return !!$window.sessionStorage.getItem(
                    AES_SETTINGS.auth.tokenKeyName
                );
            };

            /**
            * Sets the current oAuth token in sessionStorage.
            *
            * @param {String} access token
            * @method setToken
            */
            self.setToken = function (token) {
                $window.sessionStorage.setItem(
                    AES_SETTINGS.auth.tokenKeyName,
                    token
                );
            };

            /**
            * Gets access token by client id. Opening a modal
            * when user session in Newscoop is still valid,
            * is not needed then. Instead a new token is
            * obtained directly from the API.
            *
            * @method obtainToken
            * @return {Object} promise object
            */
            self.obtainToken = function () {
                var deferredGet = $q.defer();

                $http.get(Routing.generate(
                    'newscoop_gimme_users_getuseraccesstoken',
                    {clientId: AES_SETTINGS.auth.client_id},
                    true
                ),{IS_RETRY: true, IS_AUTHORIZATION_HEADER: true})
                .success(function(response) {
                    self.setToken(response.access_token);
                    deferredGet.resolve(response);
                })
                .error(function (response) {
                    deferredGet.reject(response);
                });

                return deferredGet.promise;
            };

            /**
            * Opens a modal with Newscoop login form. On successful login it
            * stores the new authentication token into session storage and
            * resolves given promise with it.
            *
            * @method newTokenByLoginModal
            * @return {Object} promise object
            */
            self.newTokenByLoginModal = function () {
                var deferred = $q.defer(),
                    dialog;

                dialog = $modal.open({
                    templateUrl: 'views/modal-login.html',
                    controller: ModalLoginCtrl,
                    controllerAs: 'ctrl',
                    windowClass: 'modalLogin',
                    backdrop: 'static'
                });

                dialog.result.then(function () {
                    toaster.add({
                        type: 'sf-info',
                        message: 'Successfully refreshed authentication token.'
                    });
                    deferred.resolve();
                })
                .catch(function (reason) {
                    toaster.add({
                        type: 'sf-error',
                        message: 'Failed to refresh authentication token.'
                    });
                    deferred.reject(reason);
                });

                return deferred.promise;
            };

        }
    ]);

}());
