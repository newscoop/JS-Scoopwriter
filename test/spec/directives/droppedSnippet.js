'use strict';

describe('Directive: droppedSnippet', function () {

    // load the directive's module
    beforeEach(module(
        'authoringEnvironmentApp',
        'app/views/dropped-snippet.html'
    ));

    var element,
    scope;

    beforeEach(inject(function ($rootScope, $compile, $templateCache) {
        //assign the template to the expected url called by the directive and put it in the cache
        var template = $templateCache.get('app/views/dropped-snippet.html');
        $templateCache.put('views/dropped-snippet.html',template);

        scope = $rootScope.$new();
        scope.foo = function() {
            return {
                title: 'test title',
                code: 'test <code>'
            };
        };
        spyOn(scope, 'foo').andCallThrough();
        element = angular.element('<dropped-snippet snippet="foo(3)"></dropped-snippet>');
        element = $compile(element)(scope);
        scope.$digest();
    }));

    xit('gets the snippet correctly', function() {
        expect(scope.foo).toHaveBeenCalledWith(3);
    });
    xit('shows a title', inject(function ($compile) {
        expect(element.find('.title').text()).toBe('test title');
    }));
    xit('shows the code', inject(function ($compile) {
        expect(element.find('.code').text()).toBe('test <code>');
    }));
    xit('shows a play button', inject(function ($compile) {
        expect(element.find('.play').length).toBe(1);
    }));
});
