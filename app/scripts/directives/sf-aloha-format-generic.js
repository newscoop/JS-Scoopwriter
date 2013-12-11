'use strict';

angular.module('authoringEnvironmentApp')
  .directive('sfAlohaFormatGeneric', ['AlohaFormattingFactory', function (AlohaFormattingFactory) {
    return {
      template: '<button class="btn action strong" rel="tooltip"' +
                'title="{{alohaElement}}"><i class="editoricon-{{alohaElement|lowercase}}"></i></button>',
      restrict: 'A',
      replace: true,
      scope: {
        alohaElement: '@alohaElement'
      },
      link: function postLink(scope, element, attrs) {
        AlohaFormattingFactory.add(scope.alohaElement);
        element.attr('disabled', (Aloha.queryCommandSupported(scope.alohaElement) && Aloha.queryCommandEnabled(scope.alohaElement)));
        element.bind('click', function(){
          Aloha.execCommand(scope.alohaElement, false, '');
          element.toggleClass('active', Aloha.queryCommandState(scope.alohaElement));
        });
      }
    };
  }]);
