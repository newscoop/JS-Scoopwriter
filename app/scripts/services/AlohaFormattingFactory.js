'use strict';

/**
* AngularJS Factory for creating formatting objects for the Aloha editor.
*
* @class AlohaFormattingFactory
*/
angular.module('authoringEnvironmentApp').factory('AlohaFormattingFactory', [
    '$rootScope',
    function ($rootScope) {

        // Whenever there is a change in editor's content selection, update
        // display statuses of editor's formatting buttons depending on
        // whether or not the corresponding formatting is in effect for the
        // currently selected content.
        $rootScope.$on('texteditor-selection-changed', function () {
            angular.forEach(formatters, function (value, key) {
                var selected = Aloha.queryCommandState(value);
                jQuery(
                    '.editoricon-' + value.toLowerCase()
                ).parent().toggleClass('active', selected);
            });
        });

        // list of names of available content formatters
        var formatters = [];

        // list of names of forbidden content formatters
        var forbidden = [
                'Insertorderedlist',
                'Insertunorderedlist'
            ];

        // Public API here
        return {
            /**
            * Returns a list of names of available content formatters.
            *
            * @method get
            * @return {Array} list available formatters' names
            */
            get: function () {
                return formatters;
            },

            /**
            * Adds formatter to the list of available content formatters. If
            * formater is forbidden, it is not added.
            *
            * @method add
            * @param formatter {String} name of the formatter
            */
            add: function (formatter) {
                if (forbidden.indexOf(formatter) === -1) {
                    formatters.push(formatter);
                }
            },

            /**
            * Removes formatter from the list of available content formatters.
            *
            * @method remove
            * @param formatter {String} name of the formatter
            */
            remove: function (formatter) {
                var idx = formatters.indexOf(formatter);
                if (idx > -1) {
                    formatters.splice(idx, 1);
                }
            },

            /**
            * Checks if particular formatter is currently active. For forbidden
            * formatters it always returns false.
            *
            * @method query
            * @param formatter {String} name of the formatter
            * @return {Boolean} true if formatter is currently active,
            *   false otherwise
            */
            query: function (formatter) {
                if (forbidden.indexOf(formatter) === -1) {
                    return Aloha.queryCommandState(formatter);
                } else {
                    return false;
                }
            }
        };
    }
]);
