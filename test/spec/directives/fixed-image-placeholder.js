'use strict';

describe('Directive: fixedImagePlaceholder', function () {

    // load the directive's module
    beforeEach(module('authoringEnvironmentApp'));

    var element,
    scope;

    beforeEach(inject(function ($rootScope, $compile, $templateCache) {
        scope = $rootScope.$new();
        var template = $templateCache.get('app/views/fixed-image-placeholder.html');
        $templateCache.put('views/fixed-image-placeholder.html', template);
        element = angular.element('<fixed-image-placeholder></fixed-image-placeholder>');
        element = $compile(element)(scope);
        scope.$digest;
    }));

    xit('contains a default element', inject(function ($compile) {
        expect($(element).find('.fixed-image-title').size()).toBe(1);
    }));
});
