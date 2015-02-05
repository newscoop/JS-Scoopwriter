'use strict';                                                                                            
angular.module('authoringEnvironmentApp').directive('sfAlohaRedoButton', [
    '$rootScope',
    function ($rootScope) {
        var template = [
            '<button class="btn btn-default btn-sm action strong" ',
            '    rel="tooltip" title="Redo">',
            '    <i class="editoricon-redo ',
            '              fa fa-repeat"></i>',
            '</button>'
        ].join('');
 
        return {
            template: template,
            restrict: 'A',
            replace: true,
            scope: {},
            link: function postLink(scope, element, attrs) {
                var available;

                function updateButtonState() {
                    available = Aloha.canRedo();
                    element.attr('disabled', !available);
                }
                
                updateButtonState();

                $rootScope.$on('texteditor-content-changed', function () {
                    updateButtonState();
                });

                $rootScope.$on('aloha-undo-clicked', function () {
                    updateButtonState();
                });
 
                element.bind('click', function () {
                    Aloha.redo();
                    /**
                     * because no texteditor-content-changed
                     * will fire on undo/redo will need to
                     * create an event to trigger
                     * the redo button to refresh its state
                     */
                    $rootScope.$emit('aloha-redo-clicked');
                    updateButtonState();
                });
            }
        };
    }
]);

