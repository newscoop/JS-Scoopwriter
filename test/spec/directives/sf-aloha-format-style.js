'use strict';

/**
* Module with tests for the droppedImage directive.
*
* @module droppedImage directive tests
*/

describe('Directive: sfAlohaFormatGeneric', function () {
    var isoScope,
        scope,
        element,
        oldAloha,
        $rootScope;

    beforeEach(module('authoringEnvironmentApp'));

    beforeEach(inject(function (_$rootScope_, $compile) {
        var html;

        html = [
            '<button data-style-element="{{element}}" ',
            'data-style-name="{{name}}" sf-aloha-format-style></button> ',
        ].join('');

        $rootScope = _$rootScope_;
        scope = $rootScope.$new();
        scope.element = 'blockquote';
        scope.name = 'Blockquote';
        element = $compile(html)(scope);
        scope.$digest();

        isoScope = element.isolateScope();

        oldAloha = Aloha;
        Aloha.addBlockQuote = function () { return true; };
        Aloha.removeBlockQuote = function () { return true; };
        Aloha.execCommand = function () { return true; };
        Aloha.trigger = function () { return true; };
        Aloha.Selection = {
            rangeObject: {
                limitObject: [
                    {
                        id: 'test-id'
                    }
                ]
            }
        };
    }));

    afterEach(function () {
        Aloha = oldAloha;
    });

    it('calls Aloha.addBlockQuote on Blockquote select', function () {
        var addBlockQuoteSpy = spyOn(Aloha, 'addBlockQuote').andReturn(true);

        isoScope.styleElement = 'blockquote';
        element.click();

        expect(addBlockQuoteSpy).toHaveBeenCalled();
    });

    it('calls Aloha.removesBlockQuote when blockquotes are found', function () {
        var removeBlockQuoteSpy = spyOn(
            Aloha, 'removeBlockQuote').andReturn(true);

        isoScope.styleElement = 'something-that-is-not-blockquote';
        Aloha.blockquoteFound = true;
        element.click();

        expect(removeBlockQuoteSpy).toHaveBeenCalled();
    });

    it('called the correct Aloha.execCommand', function () {
        var execCommandSpy = spyOn(Aloha, 'execCommand').andReturn(true);

        isoScope.styleElement = 'something-that-is-not-blockquote';
        element.click();

        expect(execCommandSpy).toHaveBeenCalledWith(
            'formatBlock', false, 'something-that-is-not-blockquote');
    });

    it('triggers aloha-smart-content-changed Aloha.execCommand', function () {
        var execCommandSpy = spyOn(Aloha, 'execCommand').andReturn(true);
        var triggerSpy = spyOn(Aloha, 'trigger').andReturn(true);

        isoScope.styleElement = 'something-that-is-not-blockquote';
        element.click();

        expect(triggerSpy).toHaveBeenCalled();
    });
});
