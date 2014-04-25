'use strict';

describe('Directive: fileUpload', function () {

    // load the directive's module
    beforeEach(module('authoringEnvironmentApp'));

    var element,
    scope;

    beforeEach(inject(function ($rootScope) {
        scope = $rootScope.$new();
        scope.handler = jasmine.createSpy('handler');
    }));

    xit('should make hidden element visible', inject(function ($compile) {
        element = angular.element('<div file-upload handler="handler"></div>');
        element = $compile(element)(scope);
        var input = $(element).find('.hidden-input');
        expect(input.size()).toBe(1);
        element.triggerHandler('click');
        var files = ['a', 'b', 'c'];
        input.files = files;
        input.triggerHandler('change');
        expect(scope.handler).toHaveBeenCalledWith(files);
    }));
});
