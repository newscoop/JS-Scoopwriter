'use strict';

/**
* AngularJS service for submitting feedback form.
*
* @class feedback
*/
angular.module('authoringEnvironmentApp').service('feedback', [
    '$http',
    '$q',
    'transform',
    function ($http, $q, transform) {
        var self = this;

        /**
        * Sends a new feedback message to email address defined
        * in php code of the plugin and returns a Feedback instance
        * representing it.
        *
        * @method submit
        * @param feedbackParams {Object} feedback form object
        *   which contains form fields
        * @return {Object} promise object which is resolved with
        *   new Feedback instance on success and rejected on error
        */
        self.submit = function (feedbackParams) {
            var deferredPost = $q.defer(),
                requestData;

            requestData = {
                feedback: feedbackParams
            };

            $http.post(
                Routing.generate(
                    'aes_send_feedback', {}, true
                ),
                requestData,
                {transformRequest: transform.formEncode}
            )
            .success(function (response) {
                deferredPost.resolve(response);
            }).error(function (responseBody) {
                deferredPost.reject(responseBody);
            });

            return deferredPost.promise;
        };
    }
]);
