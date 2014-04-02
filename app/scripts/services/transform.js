'use strict';
/**
* AngularJS Service for encoding HTML form data, making the latter suitable
* for use in a URL query string or Ajax request.
*
* @class transform
*/
angular.module('authoringEnvironmentApp').service('transform', function Transform() {
    // AngularJS will instantiate a singleton by calling "new" on this function
    /**
        * Encodes HTML form data (making it ready to use in an Ajax
        * request) and sets the Content-Type header to
        * 'application/x-www-form-urlencoded'.
        *
        * @method formEncode
        * @param data {Object} An object containing form data.
        * @param headersGetter {Function} A function which returns a list of
        *   HTTP headers (in a form of an object whose keys are header names
        *   and the values are the values of the corresponding HTTP headers).
        *
        * @return {String} Encoded form data (using jQuery's param() function).
        */
    this.formEncode = function (data, headersGetter) {
        var encoded = $.param(data);
        var headers = headersGetter();
        headers['Content-Type'] = 'application/x-www-form-urlencoded';
        return encoded;
    };
});