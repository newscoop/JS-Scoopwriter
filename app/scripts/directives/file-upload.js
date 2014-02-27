'use strict';

angular.module('authoringEnvironmentApp')
    .directive('fileUpload', function () {
        return {
            restrict: 'A',
            scope: {
                handler: '&'
            },
            link: function postLink(scope, element, attrs) {
                var input = $('<input>').attr({
                    'class': 'hidden-input',
                    type: 'file',
                    style: 'display:none'
                });
                input.on('click', function(e) {
                    e.stopPropagation();
                });
                input.on('change', function(e) {
                    var fileList = input.get(0).files;
                    scope.handler({files:fileList});
                });
                element.append(input);
                element.on('click', function(e) {
                    input.click();
                });
            }
        };
    });
