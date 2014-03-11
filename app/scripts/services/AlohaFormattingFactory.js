'use strict';

/**
* AngularJS Factory for creating formatting objects for the Aloha editor.
*
* @class AlohaFormattingFactory
*/
angular.module('authoringEnvironmentApp')
  .factory('AlohaFormattingFactory', ['$rootScope', function ($rootScope) {
    // Service logic
    // ...

    // Whenever there is a change in editor's content selection, update
    // display statuses of editor's formatting buttons depending on whether or
    // not the corresponding formatting is in effect for the selected content.
    $rootScope.$on('texteditor-selection-changed', function () {
      angular.forEach(formatters, function(value, key) {
          var selected = Aloha.queryCommandState(value);
          jQuery('.editoricon-'+value.toLowerCase()).parent().toggleClass('active', selected);
      });
    });
    

    var formatters = [];  // list of names of available content formatters

    // list of names of forbidden content formatters
    var forbidden = [
          'Insertorderedlist',
          'Insertunorderedlist'
        ];

    // Public API here
    return {
      /**
      * @class AlohaFormatting
      */

      /**
      * Returns the list of names of all available content formatters.
      * @method get
      * @return {Array} List of names of all available content formatters.
      */
      get: function () {
        return formatters;
      },

      /**
      * Adds a new formatter to the list of available formatters if this
      * formatter is not listed as forbidden.
      * @method add
      * @param Formatter {String} Name of the formatter to add.
      */
      add: function (Formatter) {
        if (forbidden.indexOf(Formatter) == -1) {
          formatters.push(Formatter);
        }
      },

      /**
      * Removes a formatter from the list of available formatters.
      * @method remove
      * @param Formatter {String} Name of the new formatter to remove.
      */
      remove: function (Formatter) {
        // XXX: this removes the last element of the array if Formatter is
        // not found in formatters - bug or a feature? Probably a bug?
        formatters.splice(formatters.indexOf(Formatter), 1);
      },

      /**
      * Returns a value indicating whether the given formatter is currently
      * in effect. For forbidden formatters it always returns false.
      *
      * @method query
      * @param Formatter {String} Name of the formatter.
      * @return {Boolean} true if Formatter is currently in effect,
      *   otherwise false.
      */
      query: function (Formatter) {
        if (forbidden.indexOf(Formatter) == -1) {
          return Aloha.queryCommandState(Formatter);
        } else {
          return false;
        }
      }
    };
  }]);
