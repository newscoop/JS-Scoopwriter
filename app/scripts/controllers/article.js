'use strict';

angular.module('authoringEnvironmentApp')
  .controller('ArticleCtrl', ['$scope', '$location', 'article', 'articleType', 'panes', 'configuration', 'mode', 'platform', '$timeout', 'circularBufferFactory', '$log', function ($scope, $location, article, articleType, panes, configuration, mode, platform, $timeout, circularBufferFactory, $log) {

      var delay = 2000;
      var search = $location.search();
      var n = search.article_number;
      var l = search.language;

      function save() {
          article
              .resource
              .save({
                  articleId: n,
                  language: l
              }, $scope.article, function() {
                  $scope.modified = false;
                  $scope.status = 'Saved';
              }, function() {
                  $scope.status = 'Error saving';
                  $scope.$timeout(save, delay);
              });
      }

      $scope.$timeout = $timeout; // for testability
      $scope.mode = mode;
      $scope.modified = false;
      $scope.status = 'Initialising';
      $scope.history = circularBufferFactory.create({size:5});

      $scope.watchCallback = function(newValue, oldValue) {
          if (angular.equals(newValue, oldValue)) {
              // initialisation
              $scope.modified = false;
              $scope.status = 'Just downloaded';
          } else {
              if (newValue && oldValue) {
                  $scope.history.push(oldValue);
                  // modified
                  if ($scope.modified) {
                      // already waiting
                  } else {
                      $scope.modified = true;
                      $scope.status = 'Modified';
                      $timeout(save, delay);
                  }
              } else {
                  // used also for testing
                  oldValue || $log.debug('the old article value is', oldValue);
                  newValue || $log.debug('the new article value is', newValue);
              }
          }
      };
      $scope.$watch('article', $scope.watchCallback, true);
      
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
          var known = [
              'date',
              'dateline',
              'main_image',
              'lede',
              'body',
              'title'
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
