'use strict';
angular.module('authoringEnvironmentApp').directive('sfAlohaFormatGeneric', [
    'AlohaFormattingFactory',
    function (AlohaFormattingFactory) {
        var template = [
            '<button class="btn btn-default btn-sm action strong" ',
            '    rel="tooltip" title="{{buttonName}}">',
            '    <i class="editoricon-{{alohaElement|lowercase}} ',
            '              fa fa-{{alohaElement|lowercase}}"></i>',
            '</button>'
        ].join('');

        return {
            template: template,
            restrict: 'A',
            replace: true,
            scope: {
                alohaElement: '@alohaElement',
                buttonName: '@buttonName'
            },
            link: function postLink(scope, element, attrs) {
                AlohaFormattingFactory.add(scope.alohaElement);
                element.attr(
                    'disabled',
                    Aloha.queryCommandSupported(scope.alohaElement) &&
                    Aloha.queryCommandEnabled(scope.alohaElement)
                );
                element.bind('click', function () {
                    Aloha.execCommand(scope.alohaElement, false, '');
                    element.toggleClass('active', AlohaFormattingFactory.query(scope.alohaElement));
                });
            }
        };
    }
]);