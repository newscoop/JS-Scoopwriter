'use strict';

describe('Service: articleType', function () {

  // load the service's module
  beforeEach(module('authoringEnvironmentApp'));

  // instantiate service
  var articleType;
  beforeEach(inject(function (_articleType_) {
    articleType = _articleType_;
  }));

  it('should do something', function () {
    expect(!!articleType).toBe(true);
  });

});
