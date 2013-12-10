'use strict';

angular.module('authoringEnvironmentApp')
  .controller('ArticleCtrl', ['$scope', '$location', 'Article', 'Articletype',
                              function ($scope, $location, Article, Articletype) {
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
      
    $scope.article = Article.get({articleId: n}, function(article) {
      $scope.type = Articletype.get({type: article.type});
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
  }]);
