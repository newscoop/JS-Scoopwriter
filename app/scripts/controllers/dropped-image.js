'use strict';

angular.module('authoringEnvironmentApp')
  .controller(
      'DroppedImageCtrl',
      ['images', '$scope', '$log', 'configuration',
       function (images, $scope, $log, configuration) {
	   $scope.root = configuration.API.rootURI;
           $scope.images = images;
           $scope.pixels = '';
           $scope.change = function(e) {
               var $t = $(e.target);
               if ($t.is('.pixels')) {
                   $scope.style.width='auto';
                   $scope.style.image = {width: $t.val() + 'px'};
                   $scope.size = action;
               }
           };
           $scope.get = function(id) {
               var includedId = images.include(id);
               var image = images.included[includedId];
               $scope.id = id;
               $scope.image = image;
               $scope.style = image.style;
               return includedId;
           };
           $scope.select = function(includedId) {
               images.selected = includedId;
           };
           $scope.size = function(s) {
               var i = images.included[images.selected];
               i.size = s;
               i.style.container.width = configuration.image.width[s];
               if ('big'==s) {
                   i.style.container.margin = '0';
               }
               if ('original'==s) {
                   i.style.container.width = 'auto';
                   i.style.image.width = 'auto';
               } else {
                   i.style.image = {};
               }
           };
           $scope.pixelsChanged = function() {
               if (angular.isNumber($scope.pixels)) {
                   var p = $scope.pixels + 'px';
                   var i = images.included[images.selected];
                   i.style.image.width = p;
               }
           };
           $scope.align = function(s) {
               var i = images.included[images.selected];
               var float, margin;
               switch (s) {
               case 'left':
                   float='left';
                   if (i.size != 'big') {
                       margin = '0 2% 0 0';
                   }
                   break;
               case 'right':
                   float='right';
                   if (i.size != 'big') {
                       margin = '0 0 0 2%';
                   }
                   break;
               case 'center':
                   float='none';
                   margin = '0 auto';
                   break;
               default:
                   $log.debug('no known action '+action);
               }
               i.style.container.float = float;
               i.style.container.margin = margin;
           };
       }]);
