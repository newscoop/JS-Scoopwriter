'use strict';

describe('Directive: sfDroppable', function () {

  // load the directive's module
  beforeEach(module('authoringEnvironmentApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('appends an element on drop', inject(function ($compile) {
    element = angular.element('<div sf-droppable><p>hey Joe</p></div>');
    element = $compile(element)(scope);
    var p = $(element.find('p'));
    var e = $.Event('drop');
    e.originalEvent = {
        dataTransfer: {
          getData: function() {
            return JSON.stringify({
              type: 'test'
            });
          }
        }
    };
    p.trigger(e);
    var dropped = p.next();
    expect(dropped.text()).toBe('test dropped');
  }));
});
