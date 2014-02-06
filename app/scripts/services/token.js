'use strict';

angular.module('authoringEnvironmentApp')
    .service('token', ['configuration', '$resource', '$window', 'endpoint', function Token(configuration, $resource, $window, endpoint) {
        // AngularJS will instantiate a singleton by calling "new" on this function
        configuration.auth.grant_type = 'client_credentials';
        return $resource(endpoint + '/oauth/v2/token', configuration.auth);
    }]);
