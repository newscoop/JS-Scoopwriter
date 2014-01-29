'use strict';

angular.module('authoringEnvironmentApp')
  .controller(
      'DroppedImageCtrl',
      ['images', '$scope', '$log',
       function (images, $scope, $log) {
           $scope.images = images;
           $scope.basename = 'spinner.jpg';
           $scope.caption = '... loading ...';
           $scope.style = {
               width: '100%',
               float: 'none'
           };
           $scope.click = function(e) {
               $log.debug(e);
               var $target = $(e.target);
               if (/btn/.test($target.attr('class'))) {
                   var action = $target.attr('data-id')
                   switch(action) {
                       case 'small':
                       $scope.style.width='20%';
                       break;
                       case 'medium':
                       $scope.style.width='50%';
                       break;
                       case 'big':
                       $scope.style.width='100%';
                       break;
                       case 'left':
                       $scope.style.float='left';
                       break;
                       case 'right':
                       $scope.style.float='right';
                       break;
                       case 'center':
                       $scope.style.float='none';
                       break;
                   }
               }
           };
           $scope.get = function(id) {
               images.byId(id)
                   .success(function(i) {
                       $scope.basename = i.basename;
                       $scope.caption = i.description;
                   });
           };
       }]);
