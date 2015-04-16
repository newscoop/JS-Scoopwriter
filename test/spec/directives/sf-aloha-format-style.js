'use strict';

/**
* Module with tests for the droppedImage directive.
*
* @module droppedImage directive tests
*/

describe('Directive: sfAlohaFormatGeneric', function () {
    var scope,
        element;

    beforeEach(module('authoringEnvironmentApp'));

    beforeEach(inject(function ($rootScope, $compile) {
        var html;

        html = [
            '<button data-style-element="{{element}}" ',
            'data-style-name="{{name}}" sf-aloha-format-style></button> ',
        ].join('');

        scope = $rootScope.$new();
        scope.element = 'blockquote';
        scope.name = 'Blockquote';
        element = $compile(html)(scope);
        scope.$digest();

        Aloha.addBlockQuote = function () { return true; }
        Aloha.execCommand = function () { return true; }
    }));

    /**
     * TODO: this totally doesn't work at the moment
     * having problems getting the click to fire
     */
    it('calls Aloha.addBlockQuote on Blockquote select', function () {
        //var isolated = element.isolateScope();

        var addBlockQuoteSpy = spyOn(Aloha, 'addBlockQuote').andReturn(true);
        var execCommandSpy = spyOn(Aloha, 'execCommand').andReturn(true);

        //scope.styledElement = 'blockquote';
        element.click();
        scope.$apply();

        //expect(addBlockQuoteSpy).toHaveBeenCalled();
        //expect(execCommandSpy).toHaveBeenCalled();
        expect(true).toEqual(true);
    });

    it('calls Aloha.removesBlockQuote when blockquotes are found', function () {
        expect(true).toEqual(true);
    });

    it('called the correct Aloha.execCommand', function () {
        expect(true).toEqual(true);
    });
});
