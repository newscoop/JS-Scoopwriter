'use strict';

angular.module('authoringEnvironmentApp')
    .filter('sortComments', ['$log', function ($log) {
        function dateCallback(s) {
            return Date(s);
        };
        return function (input, sorting) {
            switch (sorting) {
                case 'Nested':
                return _.sortBy(input, 'thread_order');
                break;
                case 'Chronological':
                var arr = _.sortBy(input, dateCallback);
                arr.reverse();
                return arr;
                break;
                default:
                var error = 'unknown sorting: '+sorting;
                $log.error(error); // angular catches exceptions sometime
                throw Error(error);
            }
        };
    }]);
