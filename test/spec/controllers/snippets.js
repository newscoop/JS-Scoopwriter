'use strict';

describe('Controller: SnippetsCtrl', function () {

    // load the controller's module
    beforeEach(module('authoringEnvironmentApp'));

    var SnippetsCtrl,
    scope;

    // Initialize the controller and a mock scope
    beforeEach(inject(function ($controller, $rootScope) {
        scope = $rootScope.$new();
        SnippetsCtrl = $controller('SnippetsCtrl', {
            $scope: scope
        });
    }));

    it('has three snippets', function () {
        expect(scope.snippets.length).toBe(3);
    });
    it('provides restoring', function () {
        scope.snippets[2].backup();
        scope.snippets[2].title = 'modified';
        expect(scope.snippets[2].title).toBe('modified');
        scope.snippets[2].restore();
        expect(scope.snippets[2].title).toBe('Sound of the story 3');
    });
    it('provides a snippet from id', function() {
        expect(scope.byId(1).title).toBe('Sound of the story');
    });
    it('adds a snippet', function () {
        scope.add('title', '<code>');
        expect(scope.snippets.length).toBe(4);
    });
    it('removes a snippet', function() {
        scope.remove(2);
        expect(scope.snippets.length).toBe(2);
    });
});
