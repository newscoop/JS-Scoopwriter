'use strict';
/**
* AngularJS Factory for creating formatting objects for the Aloha editor.
*
* @class AlohaFormattingFactory
*/
angular.module('authoringEnvironmentApp').factory('AlohaFormattingFactory', [
    '$rootScope',
    function ($rootScope) {
        // Service logic
        // ...
        // Whenever there is a change in editor's content selection, update
        // display statuses of editor's formatting buttons depending on whether or
        // not the corresponding formatting is in effect for the selected content.
        $rootScope.$on('texteditor-selection-changed', function () {
            angular.forEach(formatters, function (value, key) {
                var selected = Aloha.queryCommandState(value);
                jQuery('.editoricon-' + value.toLowerCase()).parent().toggleClass('active', selected);
            });
        });
        var formatters = [];
        // list of names of available content formatters
        // list of names of forbidden content formatters
        var forbidden = [
                'Insertorderedlist',
                'Insertunorderedlist'
            ];
        // Public API here
        return {
            get: function () {
                return formatters;
            },
            add: function (Formatter) {
                if (forbidden.indexOf(Formatter) === -1) {
                    formatters.push(Formatter);
                }
            },
            remove: function (Formatter) {
                // XXX: this removes the last element of the array if Formatter is
                // not found in formatters - bug or a feature? Probably a bug?
                formatters.splice(formatters.indexOf(Formatter), 1);
            },
            query: function (Formatter) {
                if (forbidden.indexOf(Formatter) === -1) {
                    return Aloha.queryCommandState(Formatter);
                } else {
                    return false;
                }
            }
        };
    }
]);