'use strict';

angular.module('authoringEnvironmentApp')
  .controller('MainCtrl', ['token', '$scope', '$window', 'mode', function (token, $scope, $window, mode) {
    token.get().$promise.then(function(data) {
        $window.sessionStorage.token = data.access_token;
    });
    $scope.$on('$viewContentLoaded', function(){
        jQuery('#cs-specific').prependTo('.main-background-container');
    });
    $scope.mode = mode;
  }]);
