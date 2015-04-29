'use strict';

/**
* AngularJS controller for the Feedback modal.
*/
angular.module('authoringEnvironmentApp').controller('FeedbackForm', [
    'modal',
    'feedback',
    'toaster',
    'TranslationService',
    function (modal, feedback, toaster, TranslationService) {
        var self = this;

        self.feedback = {};
        self.processing = false;
        self.messageMaxLength = 1000;

        /**
        * Opens a modal containing an feedback form
        *
        * @method feedbackModal
        */
        self.feedbackModal = function () {
            modal.show({
                title: TranslationService.trans('aes.msgs.feedback.modalHead'),
                templateUrl: 'views/feedback.html',
                windowClass: 'small'
            });
        };

        /**
        * Triggers discarding all the changes in feedback form and
        * closes the modal.
        *
        * @method cancel
        * @param $event {Object} AngularJS event object of the event that
        *     triggered the method.
        */
        self.cancel = function ($event) {
            // we need to cancel the click event so that modal machinery
            // does not close the modal immediately - we first need to
            // do some other work and only then close the modal by ourselves
            $event.preventDefault();
            $event.stopPropagation();
            self.feedback = {};
            modal.hide();
        };

        /**
        * Submits feedback form and displays success
        * or error toaster message.
        *
        * @method submit
        */
        self.submit = function () {
            self.processing = true;
            feedback.submit(self.feedback).then(function () {
                toaster.add({
                    type: 'sf-info',
                    message: TranslationService.trans(
                        'aes.msgs.feedback.success'
                    )
                });
                self.feedback = {};
                self.processing = false;
                modal.hide();
            }, function () {
                self.processing = false;
                toaster.add({
                    type: 'sf-error',
                    message: TranslationService.trans(
                        'aes.msgs.feedback.error'
                    )
                });
            });
        };
    }
]);