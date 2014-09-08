'use strict';

angular.module('authoringEnvironmentApp').service('addToUrl', function () {
    this.add = function (params, url) {
        var serialisedParams = '';
        angular.forEach(params, function (value, key) {
            serialisedParams += '&' + key + '=' + value;
        });
        if (!/[?]/.test(url)) {
            serialisedParams = '?' + serialisedParams.slice(1);
        }
        return url + serialisedParams;
    };
});
