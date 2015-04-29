'use strict';

/**
* Module with tests for the Feedback factory.
*
* @module Feedback factory tests
*/

describe('Service: feedback', function () {

    var $httpBackend,
        feedback,
        feedbackParams;

    beforeEach(module('authoringEnvironmentApp'));

    beforeEach(inject(function (_$httpBackend_, _feedback_) {
        $httpBackend = _$httpBackend_;
        feedback = _feedback_;

        feedbackParams = {
		    name: 'Jhon Doe',
		    email: 'jhon@doe.com',
		    message: 'This plugin is great!'
	    };
    }));

    describe('submit() method', function () {
        var urlCreate;

        /**
        * Helper function for verifying if Content-Type request header is
        * correctly set.
        *
        * @function headersCheck
        * @param headers {Object} request headers
        * @return {Boolean} true if check passes, false otherwise
        */
        function headersCheck(headers) {
            return headers['Content-Type'] ===
                'application/x-www-form-urlencoded';
        }

        beforeEach(function () {
            urlCreate = Routing.generate(
                'aes_send_feedback', {}, true
            );
        });

        it('makes correct request to the server to send ' +
            'feedback message',
            function () {
                var expectedPostData = $.param({
                    feedback: feedbackParams
                });

                $httpBackend.expectPOST(
                    urlCreate, expectedPostData, headersCheck
                ).respond(200);

               	feedback.submit(feedbackParams);

                $httpBackend.verifyNoOutstandingExpectation();
            }
        );

        it('resolves given promise with the response on success',
            function () {
                var onSuccessSpy = jasmine.createSpy(),
                    feedbackData;

                feedbackData = feedbackParams;

                $httpBackend.whenPOST(/.*/).respond(200);

                feedback.submit(feedbackData).then(onSuccessSpy);
                $httpBackend.flush();
                expect(onSuccessSpy).toHaveBeenCalled();
            }
        );

        it('rejects given promise on feedback send error', function () {
            var onErrorSpy = jasmine.createSpy(),
                promise;

            $httpBackend.whenPOST(/.*/).respond(422, 'Server error');

            feedback.submit(feedbackParams).catch(onErrorSpy);

            $httpBackend.flush();
            expect(onErrorSpy).toHaveBeenCalled();
        });
    });

});