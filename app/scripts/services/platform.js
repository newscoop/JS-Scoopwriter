'use strict';

angular.module('authoringEnvironmentApp')
    .service('platform', function platform() {
        // AngularJS will instantiate a singleton by calling "new" on this function
        var service = this;
        this.current = 'desktop';
        this.go = {
            mobile: function() {
                service.current = 'mobile';
            },
            desktop: function() {
                service.current = 'desktop';
            },
            tablet: function() {
                service.current = 'tablet';
            }
        };
    });
