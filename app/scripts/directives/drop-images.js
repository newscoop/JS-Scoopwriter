'use strict';

angular.module('authoringEnvironmentApp')
    .directive('dropImages', function () {
        return {
            restrict: 'A',
            scope: {
                handler: '&',
            },
            link: function postLink(scope, element, attrs) {
                // NOTE: unwrap element and wrap it into a "real jQuery" object
                // as this prevents some weird behavior in tests (i.e. event
                // handlers not registered on the $rootElement)
                element = $(element[0]);

                element.on('drop', function (e) {
                    var i,
                        file,
                        fileList,
                        filesFiltered = [],
                        pattern = new RegExp(/^image\/.*/i);

                    e.preventDefault();
                    e.stopPropagation();

                    fileList = e.originalEvent.dataTransfer.files;

                    // collect only image files (MIME type 'image/*')
                    for (i = 0; i < fileList.length; i++) {
                        file = fileList.item(i);
                        if (pattern.test(file.type)) {
                            filesFiltered.push(file);
                        }
                    }

                    scope.handler({files:filesFiltered});
                });

                element.on('dragover', function (e) {
                    e.preventDefault();  // allows drop
                    e.stopPropagation();
                    e.originalEvent.dataTransfer.dropEffect = 'copy';
                });
            }
        };
    });
