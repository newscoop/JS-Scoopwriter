'use strict';

describe('Directive: comment', function () {

    // load the directive's module
    beforeEach(module(
        'authoringEnvironmentApp',
        'app/views/comment.html'
    ));

    var element,
    scope,
    $window,
    Translator,
    mockTranslator;

    beforeEach(inject(function ($rootScope, $templateCache, $injector) {
        mockTranslator = {
            trans: function () {}
        };

        $window = $injector.get('$window');
        $window.Translator = mockTranslator;

        Translator = $injector.get('Translator');

        var template = $templateCache.get('app/views/comment.html');
        $templateCache.put('views/comment.html', template);
        
        scope = $rootScope.$new();
        scope.model = {
            created:'2013-05-02T10:11:13+0200',
            author:'Vladimir',
            image:'test.jpg',
            subject:'subject',
            comment:'comment',
            status:'approved',
            selected: true
        };
    }));

    afterEach(function () {
        delete $window.Translator;
    });

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
