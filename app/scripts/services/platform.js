'use strict';
/**
* AngularJS Service for switching the setting of a platform on which the
* application is running (affecting how the application is rendered etc.).
*
* @class platform
*/
angular.module('authoringEnvironmentApp').service('platform', function platform() {
    // AngularJS will instantiate a singleton by calling "new" on this function
    var service = this;
    // alias for the platform service itself
    /**
        * Current platform ('desktop', 'mobile' or 'tablet').
        * @property current
        * @type String
        * @default 'desktop'
        */
    this.current = 'desktop';
    /**
        * Object with methods to switch to a particular platform.
        * @property go
        * @type Object
        */
    this.go = {
        mobile: function () {
            service.current = 'mobile';
        },
        desktop: function () {
            service.current = 'desktop';
        },
        tablet: function () {
            service.current = 'tablet';
        }
    };
});