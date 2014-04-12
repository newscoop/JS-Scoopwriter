'use strict';

angular.module('authoringEnvironmentApp')
    .directive('dropImages', function () {
        return {
            restrict: 'A',
            scope: {
                handler: '&',
            },
            link: function postLink(scope, element, attrs) {
                element.on('drop', function(e){
                    e.preventDefault();
                    e.stopPropagation();
                    var files = e.originalEvent.dataTransfer.files;
                    scope.handler({files:files});
                });

                element.on('dragover', function (e) {
                    e.preventDefault();  // allows drop
                    e.stopPropagation();
                    e.originalEvent.dataTransfer.dropEffect = 'copy';
                });
            }
        };
    });
