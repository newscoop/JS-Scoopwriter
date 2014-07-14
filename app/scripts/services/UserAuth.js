'use strict';

/**
* A factory which creates a userAuth model.
*
* @class UserAuth
*/
angular.module('authoringEnvironmentApp').factory('UserAuth', [
    '$http',
    '$q',
    function ($http, $q) {
        var self = this,
            UserAuth = function () {};  // userAuth constructor function

        /**
        * Converts plain userAuth data object to a new UserAuth instance.
        *
        * @method createFromApiData
        * @param data {Object} plain object containing userAuth data
        *   (as returned by API)
        * @return {Object} new UserAuth instance
        */
        self.createFromApiData = function (data) {
            var userAuth = Object.create(UserAuth.prototype);

            ['access_token', 'expires_in', 'token_type', 'refresh_token'].forEach(
                function (attribute) {
                    userAuth[attribute] = data[attribute];
                }
            );

            return userAuth;
        };

        /**
        * Returns the AccessToken for the logged in User
        *
        * @method getToken
        * @param clientId {String} Client ID that is Trusted by Newscoop
        * @return {Object} "future" UserAuth object - initially
        *   an empty object is returned, which is later populated with the
        *   actual data (once the http promise has been successfully resolved)
        */
        UserAuth.getToken = function (clientId) {
            var deferredGet = $q.defer(),
                userAuth;

            $http.get(Routing.generate('newscoop_gimme_users_getuseraccesstoken', {'clientId': clientId}, true)
            ).success(function (response) {
                userAuth = self.createFromApiData(response);
                deferredGet.resolve(userAuth);
            }).error(function (responseBody) {
                deferredGet.reject(responseBody);
            });

            return deferredGet.promise;
        };

        return UserAuth;
    }
]);
