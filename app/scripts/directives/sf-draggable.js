'use strict';
angular.module('authoringEnvironmentApp').directive('sfDraggable', [
    'Dragdata',
    '$log',
    function (Dragdata, $log) {

        function enableDrag(element) {
            element.attr('draggable', true);
            element.addClass('draggable');
            element.on('dragstart', function (e) {
                var data = Dragdata.getData(element);
                e.originalEvent.dataTransfer.setData('Text', data);
            });
        }

        function disableDrag(element) {
            element.attr('draggable', false);
            element.removeClass('draggable');
        }

        return {
            restrict: 'A',
            scope: {
                allowDrag: '=sfDraggable'
            },
            link: function postLink(scope, element, attrs) {
                var error = Dragdata.checkDraggable(element);
                if (error) {
                    $log.debug(error);
                }

                scope.$watch(function () {
                    return scope.allowDrag;
                }, function (newVal) {
                    if (!!newVal) {
                        enableDrag(element);
                    } else {
                        disableDrag(element);
                    }
                });
            }
        };
    }
]);