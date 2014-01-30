'use strict';

describe('Controller: AttachImageCtrl', function () {

  // load the controller's module
  beforeEach(module('authoringEnvironmentApp'));

  var AttachImageCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    AttachImageCtrl = $controller('AttachImageCtrl', {
      $scope: scope
    });
  }));

  it('has the archive selected by default', function () {
    expect(scope.selected).toEqual({
        value : 'archive',
        url : 'views/attach-image/archive.html',
        description : 'From Media Archive'
    });
  });
});
