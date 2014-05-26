'use strict';

/**
* AngularJS Filter for filtering out roles that particular author already has
* assigned on the given article.
*
* @class availableRoles
*/
angular.module('authoringEnvironmentApp').filter('availableRoles', [
    function () {

        //TODO: docstrings and tests for this function
        return function (input) {
            // console.log('availableRoles filter applied');
            return input;
        };
    }
]);
