'use strict';

angular.module('authoringEnvironmentApp')
  .controller(
      'DroppedImageCtrl',
      ['images', '$scope', '$log', 'configuration',
       function (images, $scope, $log, configuration) {
           $scope.images = images;
           $scope.basename = 'spinner.jpg';
           $scope.caption = '... loading ...';
           $scope.size = 'big';
           $scope.style = {
               width: configuration.image.width.big,
               float: configuration.image.float,
               margin: '0 auto'
           };
           $scope.click = function(e) {
               $log.debug(e);
               var $button = $(e.target).closest('button');
               if (/btn/.test($button.attr('class'))) {
                   var action = $button.attr('data-id')
                   switch(action) {
                       case 'small':
                       $scope.style.width=configuration.image.width.small;
                       $scope.style.image = {};
                       $scope.size = action;
                       break;
                       case 'medium':
                       $scope.style.width=configuration.image.width.medium;
                       $scope.style.image = {};
                       $scope.size = action;
                       break;
                       case 'big':
                       $scope.style.width=configuration.image.width.big;
                       $scope.style.image = {};
                       $scope.size = action;
                       $scope.margin = '0';
                       break;
                       case 'original':
                       $scope.style.width='auto';
                       $scope.style.image = {width: 'auto'};
                       $scope.size = action;
                       break;
                       case 'left':
                       $scope.style.float='left';
                       if ($scope.size != 'big') {
                           $scope.style.margin = '0 2% 0 0';
                       }
                       break;
                       case 'right':
                       $scope.style.float='right';
                       if ($scope.size != 'big') {
                           $scope.style.margin = '0 0 0 2%';
                       }
                       break;
                       case 'center':
                       $scope.style.float='none';
                       $scope.style.margin = '0 auto';
                       break;
                       default:
                       $log.debug('no known action '+action);
                   }
               }
           };
           $scope.get = function(id) {
               var i = images.byId(id);
               $scope.basename = i.basename;
               $scope.caption = i.description;
           };
       }]);
