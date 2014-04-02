'use strict';

angular.module('authoringEnvironmentApp')
    .filter('niceDate', ['currentTime', '$filter', function (currentTime, $filter) {
        return function (input) {
            var date;
            if (typeof input === 'string') {
                date = new Date(Date.parse(input));
            } else {
                date = input;
            }
            if (currentTime.isToday(date)) {
                return 'today '+$filter('date')(date, 'H:mm');
            } else {
                return $filter('date')(date, 'dd.MM.yyyy');
            }
        };
    }]);
