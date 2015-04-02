'use strict';

/**
* AngularJS controller for the Feedback modal.
*
*/

angular.module('authoringEnvironmentApp').controller('FeedbackForm', [
    '$scope',
    'modal',
    function ($scope, modal) {        

        /**
        * Opens a modal containing an feedback form
        *
        * @method feedbackModal
        */
        $scope.feedbackModal = function () {            
            modal.show({
                title: 'Send Feedback',
                templateUrl: 'views/feedback.html'
            });
        };
    }
]);