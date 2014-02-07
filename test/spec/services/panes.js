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
    it('should tell the article class', function() {
      expect(p.articleClass).toEqual('shrink-left ');
    });
    describe('activated a pane on the opposite side', function() {
      beforeEach(function() {
        panes.active(p[0]);
      });
      it('should tell the layout', function() {
        expect(p.layout).toEqual({
          right: true,
          left: true
        });
      });
        it('should tell the article class', function() {
            expect(p.articleClass).toMatch('shrink-right');
            expect(p.articleClass).toMatch('shrink-left');
        });
    });
  });
});
