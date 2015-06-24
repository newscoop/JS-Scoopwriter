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

                    // this block sets the Aloha.activeEditable
                    // to the editable of the current Aloha.Selection
                    // needed due to a bug with the formatBlock function
                    var selEditableId = $(Aloha.Selection
                        .rangeObject.commonAncestorContainer)[0].id;
                    for (var i = 0; i < Aloha.editables.length; i++) {
                        var editable = Aloha.editables[i];
                        if (selEditableId === editable.obj[0].id) {
                            Aloha.activeEditable = Aloha.editables[i];
                        }
                    }

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
                            'formatBlock',
                            false,
                            scope.styleElement
                        );
                        // for some reason execCommand does not trigger 
                        // a change event.  We need this to fire to enable
                        // the article save button
                        Aloha.trigger('aloha-smart-content-changed', {
                            'editable': Aloha.activeEditable
                        });
                    }
                });
            }
        };
    }
);
