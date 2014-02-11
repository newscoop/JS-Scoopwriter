'use strict';

describe('Directive: comment', function () {

    // load the directive's module
    beforeEach(module('authoringEnvironmentApp'));

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
            status:'approved'
        };
    }));

    it('compiles', inject(function ($compile) {
        element = angular.element('<comment model="model"></comment>');
        element = $compile(element)(scope);
    }));
});
