'use strict';

angular.module('authoringEnvironmentApp').filter('niceDate', [
    'currentTime',
    '$filter',
    function (currentTime, $filter) {
        return function (input) {
            var date;
            if (typeof input === 'string') {
                var str = input.split(/[^0-9]/);
                date = new Date(str[0], str[1]-1, str[2],
                    str[3], str[4], str[5]);
            } else {
                date = input;
            }
            if (currentTime.isToday(date)) {
                return 'today ' + $filter('date')(date, 'H:mm');
            } else {
                return $filter('date')(date, 'dd.MM.yyyy');
            }
        };
    }
]);
