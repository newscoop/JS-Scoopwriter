'use strict';

/**
* AngularJS Service for switching between article editing modes.
*
* @class mode
*/
angular.module('authoringEnvironmentApp').service('mode', function mode() {

    /**
    * Current mode of editing ('normal' or 'zen')
    * @property current
    * @type String
    * @default 'normal'
    */
    this.current = 'normal';

    /**
    * A flag indicating whether we are in zen editing mode or not.
    * @property zen
    * @type Boolean
    * @default false
    */
    this.zen = false;

    /**
    * Switch to zen editing mode.
    * @method goZen
    */
    this.goZen = function () {
        this.current = 'zen';
        this.zen = true;
    };

    /**
    * Switch to normal editing mode.
    * @method goNormal
    */
    this.goNormal = function () {
        this.current = 'normal';
        this.zen = false;
    };
});