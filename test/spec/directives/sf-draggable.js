'use strict';

describe('Directive: sfDraggable', function () {

  // load the directive's module
  beforeEach(module('authoringEnvironmentApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  xit('sets draggable on the element', inject(function($compile) {
    element = angular.element('<div sf-draggable data-drag-type="test"></div>');
    element = $($compile(element)(scope));
    expect(element.prop('draggable')).toBe(true);
  }));

  // for some reason it does not work
  xit('saves transfer data on drag start', inject(function ($compile) {
    element = angular.element('<div sf-draggable data-drag-type="test"></div>');
    element = $($compile(element)(scope));
    var e = $.Event('dragstart');
    var d;
    e.dataTransfer = {
      setData: function() {}
    };
    spyOn(e.dataTransfer, 'setData');
    element.trigger(e);
    expect(e.dataTransfer.setData)
      .toHaveBeenCalledWith(['Text', {type: 'test'}]);
  }));
});
