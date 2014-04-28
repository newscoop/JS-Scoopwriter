'use strict';

/**
* Factory for creating FormData objects. Allows for easier mocking in tests.
*
* @class formDataFactory
*/
angular.module('authoringEnvironmentApp').factory('formDataFactory',
    function () {
        return {
            makeInstance: function () {
                return new FormData();
            }
        };
    }
);
