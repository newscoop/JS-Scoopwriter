'use strict';

/**
* Module with tests for the attach image controller.
*
* @module AttachImageCtrl controller tests
*/

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

    it('proxies images', function() {
        expect(scope.images).toBeDefined();
    });
});
