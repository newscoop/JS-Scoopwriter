'use strict';

angular.module('authoringEnvironmentApp')
  .factory('AlohaFormattingFactory', ['$rootScope', function ($rootScope) {
    // Service logic
    // ...

    $rootScope.$on('texteditor-selection-changed', function () {
      angular.forEach(formatters, function(value, key) {
          var selected = Aloha.queryCommandState(value);
          jQuery('.editoricon-'+value.toLowerCase()).parent().toggleClass('active', selected);
      });
    });
    

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
  }]);
