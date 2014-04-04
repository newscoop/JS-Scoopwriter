'use strict';

/**
* Module with tests for the modal factory.
*
* @module Modal factory tests
*/

describe('Factory: modalFactory', function () {

    var factory;

    beforeEach(module('authoringEnvironmentApp'));

    beforeEach(inject(function (modalFactory) {
        factory = modalFactory;
    }));


    it('returns an object with correct footprint', function () {
        expect(typeof factory).toBe('object');
        expect(_.size(factory)).toBe(3);
        expect(typeof factory._createConfirmInstance).toBe('function');
        expect(typeof factory.confirmLight).toBe('function');
        expect(typeof factory.confirmHeavy).toBe('function');
    });

    describe('confirmLight() method', function () {
        it('invokes factory function with correct parameters', function () {
            var callArgs,
                modal,
                spy;

            spy = spyOn(factory, '_createConfirmInstance');
            modal = factory.confirmLight('title', 'body text');

            expect(spy.callCount).toBe(1);
            callArgs = spy.mostRecentCall.args;
            expect(callArgs.length).toBe(3);
            expect(callArgs[0]).toBe('title');
            expect(callArgs[1]).toBe('body text');
            expect(callArgs[2]).toBe(false);
        });

        it('returns a modal object', function () {
            var modal,
                returnObj = {},
                spy;

            spy = spyOn(factory, '_createConfirmInstance')
                .andReturn(returnObj);

            modal = factory.confirmLight('title', 'body text');
            expect(modal).toBe(returnObj);
        });
    });

    describe('confirmHeavy() method', function () {
        it('invokes factory function with correct parameters', function () {
            var callArgs,
                modal,
                spy;

            spy = spyOn(factory, '_createConfirmInstance');
            modal = factory.confirmHeavy('title', 'body text');

            expect(spy.callCount).toBe(1);
            callArgs = spy.mostRecentCall.args;
            expect(callArgs.length).toBe(3);
            expect(callArgs[0]).toBe('title');
            expect(callArgs[1]).toBe('body text');
            expect(callArgs[2]).toBe(true);
        });

        it('returns a modal object', function () {
            var modal,
                returnObj = {},
                spy;

            spy = spyOn(factory, '_createConfirmInstance')
                .andReturn(returnObj);

            modal = factory.confirmHeavy('title', 'body text');
            expect(modal).toBe(returnObj);
        });
    });

    describe('_createConfirmInstance() method', function () {
        var modalInst,
            $modal;

        beforeEach(inject(function (_$modal_) {
            modalInst = {};
            $modal = _$modal_;
            spyOn($modal, 'open').andReturn(modalInst);
        }));

        it('invokes $modal.open() with correct parameters when creating ' +
            '"light" modal',
            function () {
                var callArgs,
                    expectedArgs,
                    resolveProp,
                    modal,
                    spy = $modal.open;

                modal = factory._createConfirmInstance(
                    'title', 'body text', false);

                expect(spy.callCount).toBe(1);
                callArgs = spy.mostRecentCall.args;
                expect(callArgs.length).toBe(1);

                expect(typeof callArgs[0]).toBe('object');
                expect(callArgs[0].templateUrl).toEqual(
                    'views/modal-confirm-light.html');
                expect(callArgs[0].controller).toBe(ModalCtrlConstructor);
                expect(callArgs[0].backdrop).toEqual('static');
                expect(callArgs[0].keyboard).toEqual(false);

                resolveProp = callArgs[0].resolve;
                expect(_.size(resolveProp)).toBe(2);
                expect(typeof resolveProp.title).toBe('function');
                expect(typeof resolveProp.text).toBe('function');
                expect(resolveProp.title()).toEqual('title');
                expect(resolveProp.text()).toEqual('body text');
        });

        it('invokes $modal.open() with correct parameters when creating ' +
            '"heavy" modal',
            function () {
                var callArgs,
                    expectedArgs,
                    resolveProp,
                    modal,
                    spy = $modal.open;

                modal = factory._createConfirmInstance(
                    'title', 'body text', true);

                expect(spy.callCount).toBe(1);
                callArgs = spy.mostRecentCall.args;
                expect(callArgs.length).toBe(1);

                expect(typeof callArgs[0]).toBe('object');
                expect(callArgs[0].templateUrl).toEqual(
                    'views/modal-confirm-heavy.html');
                expect(callArgs[0].controller).toBe(ModalCtrlConstructor);
                expect(callArgs[0].backdrop).toEqual('static');
                expect(callArgs[0].keyboard).toEqual(false);

                resolveProp = callArgs[0].resolve;
                expect(_.size(resolveProp)).toBe(2);
                expect(typeof resolveProp.title).toBe('function');
                expect(typeof resolveProp.text).toBe('function');
                expect(resolveProp.title()).toEqual('title');
                expect(resolveProp.text()).toEqual('body text');
        });

        it('returns a modal object', function () {
            var modal;

            modal = factory._createConfirmInstance('title', 'body text', true);
            expect(modal).toBe(modalInst);
        });
    });

});
