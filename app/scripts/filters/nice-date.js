'use strict';

angular.module('authoringEnvironmentApp')
    .filter('niceDate', ['currentTime', '$filter', function (currentTime, $filter) {
        return function (input) {
            if (typeof input == 'string') {
                var date = new Date(Date.parse(input));
            } else {
                var date = input;
            }
            if (currentTime.isToday(date)) {
                return 'today '+$filter('date')(date, 'H:mm');
            } else {
                return $filter('date')(date, 'dd.MM.yyyy');
            }
        };
    }]);
