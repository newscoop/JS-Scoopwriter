'use strict';

angular.module('authoringEnvironmentApp')
  .controller('ArticleCtrl', ['$scope', '$location', 'article', 'articleType', 'panes', 'configuration', 'mode', 'platform', '$timeout', function ($scope, $location, article, articleType, panes, configuration, mode, platform, $timeout) {

      var delay = 2000;
      var search = $location.search();
      var n = search.article_number;
      var l = search.language;

      function save() {
          if ($scope.modified) {
              article
                  .resource
                  .save({
                      articleId: n,
                      language: l
                  }, $scope.article, function() {
                      $scope.modified = false;
                      $scope.$timeout(save, delay);
                  }, function() {
                      $scope.$timeout(save, delay);
                  });
          } else {
              $timeout(save, delay);
          }
      }

      $scope.article = null;
      $scope.$timeout = $timeout; // for testability
      $scope.mode = mode;
      $scope.modified = false;
      $scope.$watch('article', function(newValue, oldValue) {
          if (null === oldValue) {
              // initialisation
              return;
          } else {
              $scope.modified = true;
          }
      }, true);
      $timeout(save, delay);
      
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
          $scope.modified = false;
      });
      
      // used to filter
      $scope.editable = function(field) {
          var known = [
              'date',
              'dateline',
              'main_image',
              'lede',
              'body'
          ];
          if (known.indexOf(field.name) == -1) {
              return false;
          } else {
              return true;
          }
      };

  $scope.panes = panes.query();
  $scope.platform = platform;

  }]);
