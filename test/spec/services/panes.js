'use strict';

describe('Service: panes', function () {

  // load the service's module
  beforeEach(module('authoringEnvironmentApp'));

  // instantiate service
  var panes, p;
  beforeEach(inject(function (_panes_) {
    panes = _panes_;
    p = panes.query();
  }));

  it('should tell the layout', function () {
    expect(p.layout).toEqual({
      left: false,
      right: false
    });
  });
  describe('activated a pane', function() {
    beforeEach(function() {
      panes.active(p[1]);
    });
    it('should tell the layout', function() {
      expect(p.layout).toEqual({
        left: true,
        right: false
      });
    });
    describe('activated a pane on the opposite side', function() {
      beforeEach(function() {
        panes.active(p[2]);
      });
      it('should tell the layout', function() {
        expect(p.layout).toEqual({
          right: true,
          left: true
        });
      });
    });
  });
});
