'use strict';

describe('Service: Dragdata', function () {

  // load the service's module
  beforeEach(module('authoringEnvironmentApp'));

  // instantiate service
  var Dragdata;
  beforeEach(inject(function (_Dragdata_) {
    Dragdata = _Dragdata_;
  }));

  it('should have a list of available types', function () {
    expect(Dragdata.available).toEqual(['test', 'image']);
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
        src: 'www.source.com/img.png'
      });
      // expected intermediate data
      data = JSON.stringify({
        type: 'image',
        src: 'www.source.com/img.png'
      });
    });
    it('creates a data transfer object from an image', function() {
      var d = Dragdata.getData($i);
      expect(d).toEqual(data);
    });
    it('returns a whole element to be attached to the editable', function() {
      var $r = Dragdata.getDropped(data);
      expect($r.is('img')).toBe(true);
      expect($r.attr('src')).toBe('www.source.com/img.png');
    });
  });
});
