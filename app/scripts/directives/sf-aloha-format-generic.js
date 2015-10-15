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
                var enabled,
                    supported,
                    $element = $(element);

                AlohaFormattingFactory.add(scope.alohaElement);

                supported = Aloha.queryCommandSupported(scope.alohaElement);
                enabled = Aloha.queryCommandEnabled(scope.alohaElement);
                if (typeof enabled === 'undefined') {
                    // in chrome we get undefined, but that's just fine...
                    enabled = true;
                }

                element.attr('disabled', !supported || !enabled);

                element.bind('click', function () {
                    // this block sets the Aloha.activeEditable
                    // to the editable of the current Aloha.Selection
                    // needed due to a bug with the formatBlock function
                    var selEditableId = $(Aloha.Selection
                        .rangeObject.limitObject)[0].id;
                    for (var i = 0; i < Aloha.editables.length; i++) {
                        var editable = Aloha.editables[i];
                        if (selEditableId === editable.obj[0].id) {
                            Aloha.activeEditable = Aloha.editables[i];
                        }
                    }

                    // for some reason execCommand does not trigger 
                    // a change event (ff browser only).  We need this 
                    // to fire to enable the article save button
                    Aloha.trigger('aloha-smart-content-changed', {
                        'editable': Aloha.activeEditable
                    });

                    Aloha.execCommand(scope.alohaElement, false, '');
                    element.toggleClass(
                        'active',
                        AlohaFormattingFactory.query(scope.alohaElement)
                    );
                });
            }
        };
    }
]);
