'use strict';

angular.module('authoringEnvironmentApp')
  .directive('sfAlohaFormatItalic', function () {
    return {
      template: '<button class="btn  action emphasis" rel="tooltip" title="Italics"><i class="editoricon-italic"></i></button>',
      restrict: 'A',
      replace: true,
      link: function postLink(scope, element, attrs) {
        element.attr('disabled', (Aloha.queryCommandSupported('italic') && Aloha.queryCommandEnabled('italic')));
        element.bind('click', function(){
          Aloha.execCommand('italic', false, '');
        });
      }
    };
  });
