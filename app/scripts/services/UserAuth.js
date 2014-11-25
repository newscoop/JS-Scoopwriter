/* global CSClientId */

(function () {
    'use strict';

    // TODO: also move authInterceptor interceptor here?

    /**
    * Constructor function for the login modal controller
    *
    * @class ModalLoginCtrl
    * @param $modalInstance {Object} AngularJS UI instance of the modal
    *     window the coontroller controls.
    */
    function ModalLoginCtrl($modalInstance) {
        var self = this;

        self.formData = {};

        /**
        * Form submit handler. Tries to login user and, if successful, closes
        * the modal, otherwise displays a failed login message.
        *
        * @method submit
        */
        self.submit = function () {
            console.debug('loign form submitted');

            // $modalInstance.close();
            // $modalInstance.dismiss();
        };

        // TODO: closing the modal without logging in simply
        // rejects the promise? then other parts ofthe app should display
        // some "not logged in" message, informing the user that action that
        // tiriggered the modal opening failed (e.g. saving the article)
    }

    ModalLoginCtrl.$inject = ['$modalInstance'];


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
        function ($http, $modal, $q, $window) {
            var self = this;

            ///////// NEW CODE /////////////

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
                var loginDeferred = $q.defer();

                console.debug('inside of newTokenByLoginModal() method');

                var dialog = $modal.open({
                    templateUrl: 'views/modal-login.html',
                    controller: ModalLoginCtrl,
                    controllerAs: 'ctrl',
                    windowClass: 'modalLogin',
                    backdrop: 'static'
                });

                dialog.result.then(function () {
                    // login success
                    return self.obtainNewToken();
                })
                .catch(function () {
                    // login failed
                });

                // TODO: open a modal for username and password,
                // return a promise

                // on success login obtain a new token and return that promise
                return loginDeferred.promise;
            };
        }
    ]);

}());
