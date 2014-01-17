'use strict';

angular.module('authoringEnvironmentApp')
  .directive('sfDraggable', function (Dragdata, $log) {
    return {
      restrict: 'A',
      link: function postLink(scope, element, attrs) {
        var error = Dragdata.checkDraggable(element);
        if (error) {
          $log.debug(error);
        };
        element.attr('draggable', true);
        element.on('dragstart', function(e) {
          var target = $(e.target || e.srcElement);
          var data = Dragdata.getData(target);
          e.originalEvent.dataTransfer.setData('Text', data);
        });
      }
    };
  });
