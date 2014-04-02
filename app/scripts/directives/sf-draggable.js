'use strict';
angular.module('authoringEnvironmentApp').directive('sfDraggable', [
    'Dragdata',
    '$log',
    function (Dragdata, $log) {
        return {
            restrict: 'A',
            link: function postLink(scope, element, attrs) {
                var error = Dragdata.checkDraggable(element);
                if (error) {
                    $log.debug(error);
                }
                element.attr('draggable', true);
                element.on('dragstart', function (e) {
                    var data = Dragdata.getData(element);
                    e.originalEvent.dataTransfer.setData('Text', data);
                });
            }
        };
    }
]);