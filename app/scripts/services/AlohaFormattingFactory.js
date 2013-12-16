'use strict';

angular.module('authoringEnvironmentApp')
  .factory('AlohaFormattingFactory', function () {
    // Service logic
    // ...

    var formatters = [];
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
        if (forbidden.indexOf(Formatter) == -1) {
          formatters.push(Formatter);
        }
      },
      remove: function (Formatter) {
        formatters.splice(formatters.indexOf(Formatter), 1);
      },
      query: function (Formatter) {
        if (forbidden.indexOf(Formatter) == -1) {
          return Aloha.queryCommandState(Formatter);
        } else {
          return false;
        }
      }
    };
  });
