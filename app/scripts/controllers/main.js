'use strict';

angular.module('authoringEnvironmentApp')
    .controller('MainCtrl', ['$scope', '$window', 'mode', function ($scope, $window, mode) {
        if('token' in $window.sessionStorage) {
            $scope.$on('$viewContentLoaded', function(){
                jQuery('#cs-specific').prependTo('.main-background-container');
            });
            $scope.mode = mode;
        } else {
            $window.location.href = 'http://tw-merge.lab.sourcefabric.org/oauth/v2/auth?client_id=3_uutz7mlvof4kc4wckcgcs4wg8oosgwg8gg4cg0wkkk0cc0w0k&redirect_uri=http%3A%2F%2Flocalhost:9000&response_type=token';
        }
    }]);
