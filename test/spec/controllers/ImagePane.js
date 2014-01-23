'use strict';

describe('Controller: ImagepaneCtrl', function () {

  // load the controller's module
  beforeEach(module('authoringEnvironmentApp'));

  var ImagepaneCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ImagepaneCtrl = $controller('ImagePaneCtrl', {
      $scope: scope
    });
  }));

  it('should attach images to the scope', function () {
    expect(scope.images).toBeDefined();
  });
});
