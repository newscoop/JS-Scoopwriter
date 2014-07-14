'use strict';

describe('Controller: DroppedSnippetCtrl', function () {

    // load the controller's module
    beforeEach(module('authoringEnvironmentApp'));

    var DroppedSnippetCtrl,
        Snippet,
        scope;

    // Initialize the controller and a mock scope
    beforeEach(inject(function ($controller, $rootScope, _Snippet_) {
        Snippet = _Snippet_;
        scope = $rootScope.$new();
        DroppedSnippetCtrl = $controller('DroppedSnippetCtrl', {
            $scope: scope
        });
    }));

    it('initializes the "expanded" flag in scope to false', function () {
        expect(scope.expanded).toBe(false);
    });

    describe('init() method', function () {
        var deferredGet;

        beforeEach(inject(function ($q) {
            deferredGet = $q.defer();
            spyOn(Snippet, 'getById').andCallFake(function () {
                return deferredGet.promise;
            });
        }));

        it('tries to retrieve the right snippet', function () {
            DroppedSnippetCtrl.init(8);
            expect(Snippet.getById).toHaveBeenCalledWith(8);
        });

        it('initializes the snippet object in scope', function () {
            scope.snippet = null;

            DroppedSnippetCtrl.init(8);
            deferredGet.resolve({id: 8, render: '<foo>bar</foo>'});
            scope.$apply();

            expect(scope.snippet).toEqual(
                {id: 8, render: '<foo>bar</foo>'}
            );
        });

        it('initializes marked-as-trusted snippet HTML in scope',
            inject(function ($sce) {
                var expected = $sce.trustAsHtml('<iframe>foo</iframe>');
                scope.snippetHtml = null;

                DroppedSnippetCtrl.init(8);
                deferredGet.resolve({id: 8, render: '<iframe>foo</iframe>'});
                scope.$apply();

                expect(
                    scope.snippetHtml instanceof expected.constructor
                ).toBe(true);

                expect(scope.snippetHtml.toString())
                    .toEqual(expected.toString());
            })
        );
    });

    describe('scope\'s expand() method', function () {
        it('sets the expanded flag', function () {
            scope.expanded = false;
            scope.expand();
            expect(scope.expanded).toBe(true);
        });
    });

    describe('scope\'s collapse() method', function () {
        it('clears the expanded flag', function () {
            scope.expanded = true;
            scope.collapse();
            expect(scope.expanded).toBe(false);
        });
    });

});
