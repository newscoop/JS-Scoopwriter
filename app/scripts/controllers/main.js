'use strict';

angular.module('authoringEnvironmentApp')
  .controller('MainCtrl', function ($scope) {
    $scope.$on('$viewContentLoaded', function(){
        jQuery('#cs-specific').prependTo('.main-background-container');
    });
  });