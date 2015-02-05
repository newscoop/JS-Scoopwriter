'use strict';                                                                                            
angular.module('authoringEnvironmentApp').directive('sfAlohaUndoButton', [
    '$rootScope',
    function ($rootScope) {
        var template = [
            '<button class="btn btn-default btn-sm action strong" ',
            '    rel="tooltip" title="Undo">',
            '    <i class="editoricon-undo ',
            '              fa fa-undo"></i>',
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
                    available = Aloha.canUndo();
                    element.attr('disabled', !available);
                }
                
                updateButtonState();

                $rootScope.$on('texteditor-content-changed', function () {
                    updateButtonState();
                });

                $rootScope.$on('aloha-redo-clicked', function () {
                    updateButtonState();
                });
 
                element.bind('click', function () {
                    Aloha.undo();
                    /**
                     * because no texteditor-content-changed
                     * will fire on undo/redo will need to
                     * create an event to trigger
                     * the undo button to refresh its state
                     */
                    $rootScope.$emit('aloha-undo-clicked');
                    updateButtonState();
                });
            }
        };
    }
]);

