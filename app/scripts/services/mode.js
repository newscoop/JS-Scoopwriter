'use strict';

angular.module('authoringEnvironmentApp')
    .service('mode', function mode() {
        // AngularJS will instantiate a singleton by calling "new" on this function
        this.current = 'normal';
        this.zen = false;
        this.goZen = function() {
            this.current = 'zen';
            this.zen = true;
        };
        this.goNormal = function() {
            this.current = 'normal';
            this.zen = false;
        };
    });
