'use strict';

describe('Controller: MediaArchiveCtrl', function () {

  // load the controller's module
  beforeEach(module('authoringEnvironmentApp'));

  var MediaArchiveCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    MediaArchiveCtrl = $controller('MediaArchiveCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of images to the scope', function () {
    expect(scope.images).toBeDefined();
    expect(scope.images.displayed.length).toBe(0);
  });
});
