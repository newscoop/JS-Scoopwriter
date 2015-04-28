'use strict';

/**
* Module with tests for the topics pane controller.
*
* @module PaneTopicsCtrl controller tests
*/
describe('Controller: FeedbackForm', function () {
    var feedbackService,
        FeedbackFormCtrl;

    beforeEach(module('authoringEnvironmentApp'));

    beforeEach(inject(function (
        $controller, _feedback_
    ) {
        feedbackService = _feedback_;

        FeedbackFormCtrl = $controller('FeedbackForm', {
            feedback: feedbackService
        });
    }));

    it('initializes the processing flag to false', function () {
        expect(FeedbackFormCtrl.processing).toBe(false);
    });

    it('initializes the max message length to 1000 chars', function () {
        expect(FeedbackFormCtrl.messageMaxLength).toEqual(1000);
    });

    it('initializes the feedback form', function () {
        expect(FeedbackFormCtrl.feedback).toEqual({});
    });

});
