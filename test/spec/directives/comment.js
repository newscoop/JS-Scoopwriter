'use strict';

describe('Directive: comment', function () {

    // load the directive's module
    beforeEach(module(
        'authoringEnvironmentApp',
        'app/views/comment.html'
    ));

    var element,
    scope;

    beforeEach(inject(function ($rootScope, $templateCache) {
        var template = $templateCache.get('app/views/comment.html');
        $templateCache.put('views/comment.html', template);
        
        scope = $rootScope.$new();
        scope.model = {
            date:'22.01.2013',
            author:'Vladimir',
            image:'test.jpg',
            subject:'subject',
            comment:'comment',
            status:'approved',
            selected: true
        };
    }));

    describe('compiled', function () {
        beforeEach(inject(function($compile) {
            element = angular.element('<comment model="model"></comment>');
            element = $compile(element)(scope);
            scope.$digest();
        }));
        it('has a checked checkbox', function() {
            var checkbox = $(element).find('.selected-checkbox');
            expect(checkbox.is(':checked')).toBe(true);
        });
    });
});
