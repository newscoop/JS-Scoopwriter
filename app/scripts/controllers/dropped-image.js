'use strict';

angular.module('authoringEnvironmentApp')
  .controller(
      'DroppedImageCtrl',
      ['images', '$scope', '$log', 'configuration',
       function (images, $scope, $log, configuration) {
           /* utility function to help us in case of weird errors,
            * making them more explicit */
           function getIncluded(id) {
               var i = images.included[id];
               if (typeof i == 'undefined') {
                   var error = 'image with id '+id+' is not included in the article';
                   $log.error(error);
                   throw Error(error);
               } else {
                   return i;
               }
           };
           /* ofter used in the following code */
           function getSelected() {
               return getIncluded(images.selected);
           };
	   $scope.root = configuration.API.rootURI;
           $scope.images = images;
           $scope.pixels = '';
           $scope.get = function(id) {
               var includedId = images.include(id);
               var image = getIncluded(includedId);
               $scope.id = id;
               $scope.image = image;
               return includedId;
           };
           $scope.select = function(includedId) {
               images.selected = includedId;
           };
           $scope.size = function(s) {
               var i = getSelected();
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
                   var i = getSelected();
                   i.style.image.width = p;
               }
           };
           $scope.align = function(s) {
               var i = getSelected();
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
                   $log.error('no known action '+action);
               }
               i.style.container.float = float;
               i.style.container.margin = margin;
           };
       }]);
