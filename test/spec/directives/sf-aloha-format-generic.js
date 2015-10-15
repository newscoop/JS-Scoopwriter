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
            '<button sf-aloha-format-generic ',
            '   data-button-name="{{name}}" ',
            '   data-aloha-element="{{element}}">',
            '</button> ',
        ].join('');

        $rootScope = _$rootScope_;
        scope = $rootScope.$new();
        scope.name = 'Bold';
        scope.element = 'Bold';
        element = $compile(html)(scope);
        scope.$digest();

        isoScope = element.isolateScope();

        oldAloha = Aloha;
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

    it('called the correct Aloha.execCommand', function () {
        var execCommandSpy = spyOn(Aloha, 'execCommand').andReturn(true);

        isoScope.alohaElement = 'something-that-is-not-bold';
        element.click();

        expect(execCommandSpy).toHaveBeenCalledWith(
            'something-that-is-not-bold', false, '');
    });

    it('triggers aloha-smart-content-changed Aloha.execCommand', function () {
        var execCommandSpy = spyOn(Aloha, 'execCommand').andReturn(true);
        var triggerSpy = spyOn(Aloha, 'trigger').andReturn(true);

        isoScope.alohaElement = 'something-that-is-not-bold';
        element.click();

        expect(triggerSpy).toHaveBeenCalled();
    });
});

