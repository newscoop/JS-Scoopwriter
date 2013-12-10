'use strict';

angular.module('authoringEnvironmentApp')
  .directive('sfAlohaFormatUnderline', function () {
    return {
      template: '<button class="btn  action underline" rel="tooltip" title="Underline"><i class="editoricon-underline"></i></button>',
      restrict: 'A',
      replace: true,
      link: function postLink(scope, element, attrs) {
        element.attr('disabled', (Aloha.queryCommandSupported('underline') && Aloha.queryCommandEnabled('underline')));
        element.bind('click', function(){
          Aloha.execCommand('underline', false, '');
        });
      }
    };
  });
