'use strict';

describe('Directive: editorialComment', function () {

    // load the directive's module
    beforeEach(module(
        'authoringEnvironmentApp',
        'app/views/editorial-comment.html'
    ));

    var element,
        scope;

    beforeEach(inject(function ($rootScope, $templateCache) {

        var template = $templateCache.get('app/views/editorial-comment.html');
        $templateCache.put('views/editorial-comment.html', template);

        scope = $rootScope.$new();
        scope.model = {
            created:'2013-05-02T10:11:13+0200',
            user: {
                username: 'Jhon',
                email: "jhon.doe@sourcefabric.org",
                firstName: "Administrator",
                id: 1,
                lastName: "",
                image: "http://example.com/test.jpg"
            },
            comment:'comment',
            resolved: false
        };
    }));

    describe('compiled', function () {
        beforeEach(inject(function($compile) {
            element = angular.element('<editorial-comment model="model"></editorial-comment>');
            element = $compile(element)(scope);
            scope.$digest();
        }));
        it('has a user image', function() {
            var avatar = $(element).find('.author-avatar img');
            expect(avatar.attr('src')).toBe('http://example.com/test.jpg');
        });
    });
});
