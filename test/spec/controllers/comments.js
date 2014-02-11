'use strict';

describe('Controller: CommentsCtrl', function () {

    // load the controller's module
    beforeEach(module('authoringEnvironmentApp'));

    var CommentsCtrl,
    scope,
    commentsService = {
        init: function() {}
    };

    // Initialize the controller and a mock scope
    beforeEach(inject(function ($controller, $rootScope) {
        scope = $rootScope.$new();
        CommentsCtrl = $controller('CommentsCtrl', {
            $scope: scope,
            comments: commentsService
        });
    }));

    it('proxies comments', function () {
        expect(scope.comments).toBeDefined();
    });
});
