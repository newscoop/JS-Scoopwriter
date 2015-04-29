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
                    clickFunction = function () {
                        Aloha.undo();
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
                    clickFunction = function () {
                        Aloha.redo();
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

