'use strict';

angular.module('authoringEnvironmentApp')
  .directive('sfAlohaFormatBold', function () {
    return {
      template: '<button class="btn action strong" rel="tooltip" title="Bold"><i class="editoricon-bold"></i></button>',
      restrict: 'A',
      replace: true,
      link: function postLink(scope, element, attrs) {
        element.attr('disabled', (Aloha.queryCommandSupported('bold') && Aloha.queryCommandEnabled('bold')));
        element.bind('click', function(){
          Aloha.execCommand('bold', false, '');
        });
      }
    };
  });
