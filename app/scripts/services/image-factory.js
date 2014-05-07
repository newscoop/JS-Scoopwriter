'use strict';

/**
* Factory for creating Image objects. Allows for easier mocking in tests.
*
* @class imageFactory
*/
angular.module('authoringEnvironmentApp').factory('imageFactory',
    function () {
        return {
            makeInstance: function () {
                return new Image();
            }
        };
    }
);
