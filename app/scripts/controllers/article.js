'use strict';

angular.module('authoringEnvironmentApp')
  .controller('ArticleCtrl', function ($scope, $http, $location) {
    var s, n, b;
      s = $location.search();
      n = s.f_article_number;
      // devcode: !newscoop
      if (n === undefined) {
        n = 64;
      }
      b = 'http://tw-merge.lab.sourcefabric.org'; // standalone
      // endcode
      // devcode: newscoop
      b = ''; // plugin
      // endcode
      
    $http
          .get(b + '/api/articles/' + n)
          .success(function(article) {
              $http
                  .get(b + '/api/articleTypes/' + article.type)
                  .success(function(type) {
                      $scope.type = type;
                      $scope.article = article;
                  });
      });
      // used to filter
      $scope.editable = function(field) {
          if (field.isContentField == 0) {
              return false;
          }
          var known = [
              'text',
              'long_text',
              'body'
          ];
          if (known.indexOf(field.type) == -1) {
              return false;
          };
          return true;
      };
  });
