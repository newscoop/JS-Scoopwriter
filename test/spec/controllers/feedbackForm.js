'use strict';

/**
* Module with tests for the feedback form controller.
*
* @module FeedbackForm controller tests
*/
describe('Controller: FeedbackForm', function () {
    var fakeFeedbackService,
        FeedbackFormCtrl,
        translationService,
        modal,
        scope;

    beforeEach(module('authoringEnvironmentApp'));

    beforeEach(inject(function (
        $q,
        $controller,
        $rootScope,
        _feedback_,
        _TranslationService_,
        _modal_
    ) {
        fakeFeedbackService = {
            submit: $q.defer(),
        };

        translationService = _TranslationService_;
        modal = _modal_;
        scope = $rootScope.$new();

        FeedbackFormCtrl = $controller('FeedbackForm', {
            feedback: fakeFeedbackService,
            TranslationService: translationService
        });
    }));

    it('initializes the processing flag to false', function () {
        expect(FeedbackFormCtrl.processing).toBe(false);
    });

    it('initializes the max message length to 1000 chars', function () {
        expect(FeedbackFormCtrl.messageMaxLength).toEqual(1000);
    });

    it('initializes the feedback form object', function () {
        expect(FeedbackFormCtrl.feedback).toEqual({});
    });

    describe('controller\'s feedbackModal() method', function () {
        beforeEach(inject(function (_modal_) {
            spyOn(modal, 'show');
        }));

        it('opens a modal dialog', function () {
            FeedbackFormCtrl.feedbackModal();
            expect(modal.show).toHaveBeenCalledWith({
                title: translationService.trans('aes.msgs.feedback.modalHead'),
                templateUrl: 'views/feedback.html',
                windowClass: 'small'
            });
        });
    });

    describe('controller\'s cancel() method', function () {
        var eventObj;

        beforeEach(function () {
            spyOn(modal, 'hide');
            eventObj = {
                preventDefault: function () {},
                stopPropagation: function () {}
            };
        });

        it('clears feedback form on modal close', function () {
            FeedbackFormCtrl.feedback = {
                name: 'Jhon',
                email: 'jhon@doe.com',
                message: 'Test messsage.'
            };

            FeedbackFormCtrl.cancel(eventObj);
            expect(FeedbackFormCtrl.feedback).toEqual({});
        });

        it('closes the modal', function () {
            FeedbackFormCtrl.cancel(eventObj);
            expect(modal.hide).toHaveBeenCalled();
        });
    });

    describe('controller\'s submit() method', function () {
        var deferred,
            toaster;

        beforeEach(inject(function ($q, _toaster_) {
            deferred = $q.defer();
            toaster = _toaster_;
            spyOn(fakeFeedbackService, 'submit').andReturn(deferred.promise);
            spyOn(toaster, 'add').andReturn(deferred.promise);
            spyOn(modal, 'hide');
            FeedbackFormCtrl.processing = true;
        }));

        it('triggers feedback form submit', function () {
            FeedbackFormCtrl.submit();
            deferred.resolve(true);
            expect(fakeFeedbackService.submit).toHaveBeenCalled();
        });

        it('calls toaster.add with correct params on success', function () {
            FeedbackFormCtrl.submit();
            deferred.resolve(true);
            scope.$digest();
            expect(toaster.add).toHaveBeenCalledWith({
                type: 'sf-info',
                message: 'aes.msgs.feedback.success'
            });
        });

        it('calls toaster.add with correct params on error', function () {
            FeedbackFormCtrl.submit();
            deferred.reject(false);
            scope.$digest();
            expect(toaster.add).toHaveBeenCalledWith({
                type: 'sf-error',
                message: 'aes.msgs.feedback.error'
            });
            expect(FeedbackFormCtrl.processing).toBe(false);
        });

        it('closes the modal on success feedback form submit', function () {
            FeedbackFormCtrl.submit();
            deferred.resolve(true);
            scope.$digest();
            expect(FeedbackFormCtrl.feedback).toEqual({});
            expect(FeedbackFormCtrl.processing).toBe(false);
            expect(modal.hide).toHaveBeenCalled();
        });
    });

});
