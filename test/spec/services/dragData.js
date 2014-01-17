'use strict';

describe('Service: Dragdata', function () {
  
  /* convenience function to parse strings for comparison, because
   * also the same JSON object may generate two different strings when
   * serialised */
  var p = function(s) { return JSON.parse(s); };

  // load the service's module
  beforeEach(module('authoringEnvironmentApp'));

  // instantiate service
  var Dragdata;
  beforeEach(inject(function (_Dragdata_) {
    Dragdata = _Dragdata_;
  }));

  it('should have a list of available types', function () {
    expect(Dragdata.available()).toEqual(['test', 'image']);
  });

  describe('for a common element', function() {
    it('can detect a wrong format', function() {
      var $e = $('<div>');
      expect(Dragdata.checkDraggable($e))
        .toBe('error: a draggable element has not a data-draggable-type attribute');
    });
  });

  /* the test type is for higher level tests that rely on this
   * service, like in the droppable directive */
  describe('for a test type', function() {
    var data;
    beforeEach(function() {
      // expected intermediate data
      data = JSON.stringify({
        type: 'test'
      });
    });
    it('returns a whole element to be attached to the editable', function() {
      var $r = Dragdata.getDropped(data);
      expect($r.is('div')).toBe(true);
      expect($r.text()).toBe('test dropped');
    });
  });
  describe('for an image type', function() {
    var $i, data;
    beforeEach(function() {
      // initial element
      $i = $('<img>').attr({
        'data-draggable-type': 'image',
        src: 'www.source.com/img.png'
      });
      // expected intermediate data
      data = JSON.stringify({
        type: 'image',
        src: 'www.source.com/img.png'
      });
    });
    it('finds no error', function() {
      expect(Dragdata.checkDraggable($i)).toBe(false);
    });
    it('creates a data transfer object from an image', function() {
      var d = Dragdata.getData($i);
      expect(p(d)).toEqual(p(data));
    });
    it('returns a whole element to be attached to the editable', function() {
      var $r = Dragdata.getDropped(data);
      expect($r.is('img')).toBe(true);
      expect($r.attr('src')).toBe('www.source.com/img.png');
    });
  });
});
