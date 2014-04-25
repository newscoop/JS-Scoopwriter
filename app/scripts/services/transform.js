'use strict';

/**
* AngularJS Service for encoding HTML form data, making the latter suitable
* for use in a URL query string or Ajax request.
*
* @class transform
*/
angular.module('authoringEnvironmentApp').service('transform', function () {

    /**
    * Encodes HTML form data (making it ready to use in an Ajax
    * request) using jQuery's param() function.
    *
    * @method formEncodeData
    * @param data {Object} object containing form data
    *
    * @return {String} encoded form data
    */
    function formEncodeData(data) {
        return $.param(data);
    }

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
    * @return {String} encoded form data
    */
    this.formEncode = function(data, headersGetter) {
        var headers = headersGetter();
        headers['Content-Type'] = 'application/x-www-form-urlencoded';
        return formEncodeData(data);
    };

    this.formEncodeData = formEncodeData;
});
