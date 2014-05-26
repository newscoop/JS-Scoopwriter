'use strict';

/**
* AngularJS Filter for sorting article comments by their creation date or
* by their hierarchy.
*
* @class sortComments
*/
angular.module('authoringEnvironmentApp')
    .filter('sortComments', ['$log', function ($log) {

        /**
        * Extracts item's `created` attribute and uses it to create a
        * javascript Date object from it.
        * Useful as a parameter to array sorting functions.
        *
        * @class dateCallback
        * @param item {Object} Object containing article comment's (meta)data
        * @return {Object} comment's creation date
        */
        function dateCallback(item) {
            return new Date(item.created);
        }

        return function (input, sorting) {
            var arr,
                error;

            switch (sorting) {
            case 'Nested':
                return _.sortBy(input, 'nestedPosition');
            case 'Chronological':
                arr = _.sortBy(input, dateCallback);
                arr.reverse();
                return arr;
            case 'Chronological (asc.)':
                return _.sortBy(input, dateCallback);
            default:
                error = 'unknown sorting: ' + sorting;
                $log.error(error);  // angular catches exceptions sometime
                throw new Error(error);
            }
        };
    }]);
