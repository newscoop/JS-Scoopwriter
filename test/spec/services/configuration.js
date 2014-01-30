'use strict';

describe('Service: Configuration', function () {

  // load the service's module
  beforeEach(module('authoringEnvironmentApp'));

  // instantiate service
  var Configuration;
  beforeEach(inject(function (_configuration_) {
    Configuration = _configuration_;
  }));

  it('defines widths', function () {
    expect(Configuration.image.width.small).toBeDefined();
    expect(Configuration.image.width.medium).toBeDefined();
    expect(Configuration.image.width.big).toBeDefined();
  });

});
