'use strict';

angular.module('authoringEnvironmentApp')
  .service('Dragdata', function Dragdata($log) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    this.available = ['test', 'image'];

    this.getData = function(element) {
      if (element.attr('data-draggable-type') == 'test') {
        return JSON.stringify({
          type: 'test'
        });
      }
      if (element.is('img')) {
        return JSON.stringify({
          type: 'image',
          src: element.attr('src')
        });
      }
    };

    this.getDropped = function(text) {
      var data = JSON.parse(text);
      switch (data.type) {
      case 'test':
        return $('<div>').text('test dropped');
        break;
      case 'image':
        return $('<img>').attr({
          src: data.src
        });
        break;
      default:
        $log.debug('getDropped function called on a malformed data object, no known type into it');
      }
    };

  });
