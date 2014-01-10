'use strict';

angular.module('authoringEnvironmentApp')
  .directive('sfDraggable', function (Dragdata) {
    return {
      restrict: 'A',
      link: function postLink(scope, element, attrs) {
        element.on('dragstart', function(e) {
          var target = $(e.target || e.srcElement);
          var data = Dragdata.getData(target);
          e.originalEvent.dataTransfer.setData('Text', data);
        });
      }
    };
  });
