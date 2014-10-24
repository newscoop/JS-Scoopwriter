'use strict';

/**
* AngularJS Filter for filtering out any HTML from the given text.
*
* @class stripHTML
*/
angular.module('authoringEnvironmentApp').filter('stripHTML', [
    function () {
        // regex for replacing all non-breakable spaces with ordinary spaces
        var nbspReplace = new RegExp( String.fromCharCode(160), 'g');

        return function (input) {
            return $('<div>').html(input).text().replace(nbspReplace, ' ');
        };
    }
]);
