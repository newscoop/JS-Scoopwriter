'use strict';

/**
* Factory for creating Date objects. Allows for easier mocking in tests.
*
* @class dateFactory
*/
angular.module('authoringEnvironmentApp').factory('dateFactory',
    function () {
        return {
            makeInstance: function () {
                return new Date();
            }
        };
    }
);
