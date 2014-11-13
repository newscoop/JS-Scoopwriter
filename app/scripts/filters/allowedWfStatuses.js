'use strict';

/**
* AngularJS Filter for filtering out article workflow states which cannot be
* reached from the current workflow state.
*
* @class allowedWfStatuses
*/
angular.module('authoringEnvironmentApp').filter('allowedWfStatuses', [
    'Article',
    function (Article) {

        /**
        * From the given list of article workflow statuses it filters out all
        * those for which transition is not allowed from the article's current
        * workflow status.
        *
        * @method allowedWfStatuses
        * @param wfStatuses {Array} list of all possible article workflow
        *   statuses. Each item must be an object with a "value" attribute,
        *   representing the value (ID) of a particular workflow status.
        * @param articleStatus {String} article's current workflow status
        * @param issueStatus {String} current article issue's workflow status
        * @return {Array} list of filtered workflow statuses
        */
        return function (wfStatuses, articleStatus, issueStatus) {
            var filtered = [];

            // all statuses are always allowed, except for the "Published with
            // issue" which has a special condition
            wfStatuses.forEach(function (status) {
                var allowed = true;
                if (status.value === Article.wfStatus.PUBLISHED_W_ISS) {
                    allowed = (
                        articleStatus !== Article.wfStatus.PUBLISHED &&
                        issueStatus !== Article.issueWfStatus.PUBLISHED
                    );
                }
                if (allowed) {
                    filtered.push(status);
                }
            });

            return filtered;
        };
    }
]);
