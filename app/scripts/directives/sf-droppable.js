'use strict';

angular.module('authoringEnvironmentApp')
  .directive('sfDroppable', ['$compile', 'Dragdata', function ($compile, Dragdata) {
    /* the selector for event delegation. in future also aloha blocks
     * may be added */
    var sel = 'p';
    var placeholderClass = 'drag-drop-placeholder';
    var place = '.' + placeholderClass;
    return {
      restrict: 'A',
      link: function postLink(scope, element, attrs) {
        $(element)
          .on('dragover', sel, function(e) {
            var target = $(e.target);
            if (!target.next().is(place)) {
              target.after($('<div>')
                .addClass(placeholderClass));
            }
          })
          .on('dragleave', sel, function(e) {
            if ($(e.target).next().is(place)) {
              $(place).remove();
            };
          })
          .on('drop', sel, function(e) {  
            e.preventDefault(); // to prevent browser element appending
            e.stopPropagation();
            var target = $(e.target);
            var dropped = Dragdata
              .getDropped(e.originalEvent.dataTransfer.getData('Text'));
            if (target.next().is(place)) {
              $(place).remove();
            };
            target.after($compile(dropped)(scope));
          });
      }
    }
  }]);
