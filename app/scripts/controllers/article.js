'use strict';

angular.module('authoringEnvironmentApp')
  .controller('ArticleCtrl', ['$scope', '$location', 'article', 'articleType', 'panes', 'configuration', 'mode', 'platform', function ($scope, $location, article, articleType, panes, configuration, mode, platform) {

      var search = $location.search();
      var n = search.article_number;
      var l = search.language_id;

      $scope.mode = mode;
      
      article.init({
          articleId: n,
          language: l
      });
      article.promise.then(function(article) {
          $scope.article = article;
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
