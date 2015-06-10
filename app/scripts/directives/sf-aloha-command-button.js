'use strict';
angular.module('authoringEnvironmentApp').directive('sfAlohaCommandButton', [
    '$rootScope',
    function ($rootScope) {
        var template = [
            '<button class="btn btn-default btn-sm action strong" ',
            '    rel="tooltip" title="{{ ::buttonName }}">',
            '    <i class="editoricon-{{ ::buttonIcon }} ',
            '              fa fa-{{ ::buttonIcon }}"></i>',
            '</button>'
        ].join('');
 
        return {
            template: template,
            restrict: 'A',
            replace: true,
            scope: {
                buttonName: '@buttonName',
                buttonIcon: '@buttonIcon',
                buttonCommand: '@buttonCommand'
            },
            link: function postLink(scope, element, attrs) {
                var checkAvailable,
                    clickFunction,
                    clickEvent,
                    checkEvent;

                if (scope.buttonCommand === 'undo') {
                    checkAvailable = function () {
                        if (typeof Aloha.canUndo === 'function') {
                            return Aloha.canUndo();
                        } else {
                            return false;
                        }
                    };
                    checkEvent = 'aloha-redo-clicked';
                    clickEvent = 'aloha-undo-clicked';
                    clickFunction = function (e) {
                        Aloha.undo();
                        var editable = Aloha.undoneEditable;
                        editable.editable = {
                            'originalObj': $(Aloha.undoneEditable
                                .originalObj[0].outerHTML)
                        };
                        editable.triggerType = 'undo';
                        $rootScope.$emit(
                            'texteditor-content-changed',
                            e,
                            editable
                        );
                    };
                }

                if (scope.buttonCommand === 'redo') {
                    checkAvailable = function () {
                        if (typeof Aloha.canRedo === 'function') {
                            return Aloha.canRedo();
                        } else {
                            return false;
                        }
                    };
                    checkEvent = 'aloha-undo-clicked';
                    clickEvent = 'aloha-redo-clicked';
                    clickFunction = function (e) {
                        Aloha.redo();
                        var editable = Aloha.redoneEditable;
                        editable.editable = {
                            'originalObj': $(Aloha.undoneEditable
                                .originalObj[0].outerHTML)
                        };
                        editable.triggerType = 'undo';
                        $rootScope.$emit(
                            'texteditor-content-changed',
                            e,
                            editable
                        );
                    };
                }

                function updateButtonState() {
                    element.attr('disabled', !checkAvailable());
                }

                updateButtonState();

                $rootScope.$on('texteditor-content-changed', function () {
                    updateButtonState();
                });

                $rootScope.$on(checkEvent, function () {
                    updateButtonState();
                });
 
                element.bind('click', function () {
                    clickFunction();
                    $rootScope.$emit(clickEvent);
                    updateButtonState();
                });
            }
        };
    }
]);

