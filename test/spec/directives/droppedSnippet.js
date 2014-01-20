'use strict';

describe('Directive: droppedSnippet', function () {

    // load the directive's module
    beforeEach(module('authoringEnvironmentApp'));

    var element,
    scope;

    beforeEach(inject(function ($rootScope, $compile) {
        scope = $rootScope.$new();
        scope.foo = function() {
            return {
                title: 'test title',
                code: 'test <code>'
            };
        };
        spyOn(scope, 'foo').andCallThrough();
        element = angular.element('<dropped-snippet id="3" get="foo(id)"></dropped-snippet>');
        element = $compile(element)(scope);
    }));

    it('gets the snippet correctly', function() {
        expect(scope.foo).toHaveBeenCalledWith(3);
    });
    it('shows a title', inject(function ($compile) {
        expect(element.find('.title').text()).toBe('test title');
    }));
    it('shows the code', inject(function ($compile) {
        expect(element.find('.code').text()).toBe('test <code>');
    }));
    it('shows a play button', inject(function ($compile) {
        expect(element.find('.play').length).toBe(1);
    }));
});
