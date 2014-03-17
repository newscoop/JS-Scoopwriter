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
        var mock = {
            title: 'test title',
            code: '<test></test>'
        };
        scope.foo = function() {
            return mock;
        };
        spyOn(scope, 'foo').andCallThrough();
        element = angular.element('<dropped-snippet snippet="foo(3)"></dropped-snippet>');
        element = $compile(element)(scope);
        scope.$digest();
    }));

    it('gets the snippet correctly', function() {
        expect(scope.foo).toHaveBeenCalledWith(3);
    });
    describe('the title element', function() {
        var $title;
        beforeEach(function() {
            $title = $(element).find('.title');
        });
        it('is one', inject(function ($compile) {
            expect($title.length).toBe(1);
        }));
        it('has the right text', inject(function ($compile) {
            expect($title.text()).toBe('test title');
        }));
    });
    describe('after expand', function () {
        beforeEach(function() {
            $(element).find('.glyphicon-chevron-right').click();
        });
        describe('the preview element', function() {
            var $preview;
            beforeEach(function() {
                $preview = $(element).find('.preview');
            });
            it('is one', function() {
                expect($preview.length).toBe(1);
            });
            xit('has the right content', function() {
                expect($preview.html()).toBe('<test></test>');
            });
        });
    });
});
