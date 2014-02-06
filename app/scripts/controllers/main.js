'use strict';

angular.module('authoringEnvironmentApp')
  .controller('MainCtrl', ['token', '$scope', '$window', function (token, $scope, $window) {
    token.get().$promise.then(function(data) {
        $window.sessionStorage.token = data.access_token;
    });
    $scope.$on('$viewContentLoaded', function(){
        jQuery('#cs-specific').prependTo('.main-background-container');
    });
  }]);
