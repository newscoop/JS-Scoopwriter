'use strict';

angular.module('authoringEnvironmentApp')
  .factory('AlohaFormattingFactory', function () {
    // Service logic
    // ...

    var formatters = [];

    // Public API here
    return {
      get: function () {
        return formatters;
      },
      add: function (Formatter) {
        formatters.push(Formatter);
      },
      remove: function (Formatter) {
        formatters.splice(formatters.indexOf(Formatter), 1);
      }
    };
  });
