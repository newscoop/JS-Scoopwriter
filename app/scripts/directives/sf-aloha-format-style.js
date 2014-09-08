'use strict';
angular.module('authoringEnvironmentApp').directive(
    'sfAlohaFormatStyle',
    function () {
        return {
            template: '<button class="dropdown-button">{{styleName}}</button>',
            restrict: 'A',
            replace: true,
            scope: {
                styleElement: '@styleElement',
                styleName: '@styleName'
            },
            link: function postLink(scope, element, attrs) {
                var isDisabled = (
                    Aloha.queryCommandSupported('formatBlock') &&
                    Aloha.queryCommandEnabled('formatBlock')
                );
                element.toggleClass('disabled', isDisabled);
                element.bind('click', function () {
                    Aloha.execCommand(
                        'formatBlock', false, scope.styleElement);
                });
            }
        };
    }
);
