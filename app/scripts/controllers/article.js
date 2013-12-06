'use strict';

angular.module('authoringEnvironmentApp')
  .controller('ArticleCtrl', function ($scope, $http, $location) {
    var s = $location.search(),
      n = s.f_article_number;
    $http.get('http://tw-merge.lab.sourcefabric.org/api/articles/' + n)
      .success(function(data) {
          $scope.article = data;
      });
  });
