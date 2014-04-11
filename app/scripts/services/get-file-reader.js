'use strict';
/* the file reader is wrapped in a service just in order to mock it easily */
angular.module('authoringEnvironmentApp').factory('getFileReader',
    function () {
        return {
            get: function() {
                return new FileReader();
            }
        };
    }
);
