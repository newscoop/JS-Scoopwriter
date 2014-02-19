'use strict';

angular.module('authoringEnvironmentApp')
    .directive('fixedImagePlaceholder', function () {
        return {
            templateUrl: 'views/fixed-image-placeholder.html',
            restrict: 'E',
            link: function postLink(scope, element, attrs) {
                element.on('drop', function(e) {
                    e.preventDefault();
                    var data = e.originalEvent.dataTransfer.getData('Text');
                    scope.onDrop(data);
                });
            }
        };
    });
