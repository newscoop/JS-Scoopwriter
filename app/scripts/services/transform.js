'use strict';

angular.module('authoringEnvironmentApp')
    .service('transform', function Transform() {
        // AngularJS will instantiate a singleton by calling "new" on this function
        this.formEncode = function(data, headersGetter) {
            var encoded = $.param(data);
            var headers = headersGetter();
            headers['Content-Type'] = 'application/x-www-form-urlencoded';
            return encoded;
        };
    });
