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
                    // blockquotes implemented with custom Aloha plugin
                    // because aloha-cite is broken with our Aloha
                    // implementation, thus we have an exception
                    // in handeling here
                    if (scope.styleElement === 'blockquote') {
                        Aloha.addBlockQuote();
                    } else {
                        if (Aloha.blockquoteFound) {
                            Aloha.removeBlockQuote();
                        }
                        Aloha.execCommand(
                            'formatBlock', false, scope.styleElement);
                    }
                });
            }
        };
    }
);
