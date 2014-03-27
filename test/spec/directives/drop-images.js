'use strict';

describe('Directive: dropImages', function () {

    // load the directive's module
    beforeEach(module('authoringEnvironmentApp'));

    var element,
    scope;

    beforeEach(inject(function ($rootScope) {
        scope = $rootScope.$new();
        scope.handler = jasmine.createSpy('handler');
    }));

    xit('handles file drop', inject(function ($compile) {
        element = angular
            .element('<div drop-images handler="handler(files)"><p></p></div>');
        element = $compile(element)(scope);
        var p = $(element.find('p'));
        var e = $.Event('drop');
        var files = ['a', 'b', 'c'];
        e.originalEvent = {
            dataTransfer: {
                files: files
            }
        };
        p.trigger(e);
        expect(scope.handler).toHaveBeenCalledWith(files);
    }));
});
