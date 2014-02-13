'use strict';

angular.module('authoringEnvironmentApp')
  .controller('ArticleCtrl',
              ['$scope', '$location', 'article', 'articleType', 'panes', 'configuration', 'mode', 'platform',
               function ($scope, $location, article, articleType, panes, configuration, mode, platform) {
    var s, n, b, l;
      s = $location.search();
      n = s.f_article_number;
      l = s.f_language_id;
      // devcode: !newscoop
      if (n === undefined) {
        n = 64;
      }
      if (l === undefined) {
        l = 'en';
      }
      b = 'http://tw-merge.lab.sourcefabric.org'; // standalone
      // endcode
      // devcode: newscoop
      b = ''; // plugin
      // endcode

    $scope.mode = mode;
      
    $scope.article = article.get({
        articleId: n,
        language: l
    }, function(article) {
        $scope.type = articleType.get({type: article.type}, function() {
            var additional = configuration.additionalFields[article.type];
            additional.forEach(function(field) {
                $scope.type.fields.push(field);
            });
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
              'body',
              'fixed_image'
          ];
          if (known.indexOf(field.type) == -1) {
              return false;
          };
          return true;
      };

  $scope.panes = panes.query();
  $scope.platform = platform;

  }]);
