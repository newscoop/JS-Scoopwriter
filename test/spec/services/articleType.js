'use strict';

describe('Service: articletype', function () {

  // load the service's module
  beforeEach(module('authoringEnvironmentApp'));

  // instantiate service
  var articletype;
  beforeEach(inject(function (_articletype_) {
    articletype = _articletype_;
  }));

  it('should do something', function () {
    expect(!!articletype).toBe(true);
  });

});
