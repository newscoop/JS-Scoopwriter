'use strict';

/**
* Module with tests for the modal controller constructor.
*
* @module Modal controller constructor tests
*/

describe('Controller: ModalCtrlConstructor', function () {
    var modalCtrl,
        modalInst,
        scope;

    beforeEach(module('authoringEnvironmentApp'));

    beforeEach(inject(function ($rootScope) {
        var text = 'modal body text',
            title = 'modal title';

        scope = $rootScope.$new();
        modalInst = {
            close: jasmine.createSpy('close()'),
            dismiss: jasmine.createSpy('dismiss()')
        };

        modalCtrl = new ModalCtrlConstructor(scope, modalInst, title, text);
    }));

    it('sets title in the scope', function () {
        expect(scope.title).toBe('modal title');
    });

    it('sets text in the scope', function () {
        expect(scope.text).toBe('modal body text');
    });

    it('scope\'s ok() method closes modal instance (resolved as "confirmed")',
        function () {
            var callArgs;
            scope.ok();
            expect(modalInst.close).toHaveBeenCalled;

            callArgs = modalInst.close.mostRecentCall.args;
            expect(callArgs.length).toEqual(1);
            expect(callArgs[0]).toEqual(true);
    });

    it('scope\'s cancel() method dismisses modal instance ' +
        '(resolved as "rejected")',
        function () {
            var callArgs;
            scope.cancel();
            expect(modalInst.dismiss).toHaveBeenCalled;

            callArgs = modalInst.dismiss.mostRecentCall.args;
            expect(callArgs.length).toEqual(1);
            expect(callArgs[0]).toEqual(false);
    });

});
