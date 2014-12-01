
(function () {
    'use strict';

    /**
    * Constructor function for the login modal controller
    *
    * @class ModalLoginCtrl
    */
    // TODO: tests
    function ModalLoginCtrl($modalInstance, userAuth) {
        var self = this;

        // XXX: add a way to close the modal without logging in?
        // in this case call $modalInstance.dismiss();
        // Other parts of the application should then display some
        // "not logged in" toast message, informing the user that action that
        // triggered the modal opening failed (e.g. saving the article)

        // TODO: explain why this loaded handler... b/c redirect occurs
        self.iframeLoadedHandler = function (location) {
            if (typeof location.hash !== 'string') {
                return;  // empty TODO: test on server instance (same origin)
            }

            var rex = new RegExp('access_token=(\\w+)');
            var matches = rex.exec(location.hash);
            if (matches.length > 1) {
                var token = matches[1];
                console.debug('modal: token parsed!', token);
                $modalInstance.close(token);
            } else {
                console.debug('modal: no token found');
            }
        };
    }

    ModalLoginCtrl.$inject = ['$modalInstance', 'userAuth'];


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
                return $window.sessionStorage.getItem('token');
            };

            /**
            * Returns true if the current user is authenticated (=has a token),
            * otherwise false.
            *
            * @method isAuthenticated
            * @return {Boolean}
            */
            self.isAuthenticated = function () {
                return !!$window.sessionStorage.getItem('token');
            };

            self.newTokenByLoginModal = function () {
                var deferred = $q.defer();

                var dialog = $modal.open({
                    templateUrl: 'views/modal-login.html',
                    controller: ModalLoginCtrl,
                    controllerAs: 'ctrl',
                    windowClass: 'modalLogin',
                    backdrop: 'static'
                });

                dialog.result.then(function (token) {
                    console.debug('uAuth: login through modal success',
                        'we have new token', token);

                    $window.sessionStorage.setItem('token', token);
                    deferred.resolve(token);

                    toaster.add({
                        type: 'sf-info',
                        message: 'Successfully refreshed authentication token.'
                    });
                })
                .catch(function (reason) {
                    console.debug('uAuth: login through modal failed');
                    deferred.reject(reason);

                    toaster.add({
                        type: 'sf-error',
                        message: 'Failed to refresh authentication token.'
                    });
                });

                return deferred.promise;
            };

        }
    ]);

}());
