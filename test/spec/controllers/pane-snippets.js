'use strict';

describe('Controller: PaneSnippetsCtrl', function () {

    // load the controller's module
    beforeEach(module('authoringEnvironmentApp'));

    var SnippetsCtrl,
        scope;

    // Initialize the controller and a mock scope
    beforeEach(inject(function ($controller, $rootScope) {
        scope = $rootScope.$new();
        SnippetsCtrl = $controller('PaneSnippetsCtrl', {
            $scope: scope
        });
    }));

    it('initializes showAddSnippet flag to false', function () {
        expect(scope.showAddSnippet).toBe(false);
    });
});
