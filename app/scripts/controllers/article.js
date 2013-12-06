'use strict';

angular.module('authoringEnvironmentApp')
  .controller('ArticleCtrl', function ($scope, $http) {
    $http.get('http://tw-merge.lab.sourcefabric.org/api/articles/64')
      .success(function(data) {
          $scope.article = data;
      });
  });
