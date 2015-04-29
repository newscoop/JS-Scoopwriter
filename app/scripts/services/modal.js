'use strict';

/**
* AngularJS Service for displaying a modal box (overlay) on a page.
*
* @class modal
*/
angular.module('authoringEnvironmentApp').service('modal', [
    '$templateCache',
    '$log',
    '$http',
    function modal($templateCache, $log, $http) {
        // jQuery selector for the modal's root DOM element
        var selector = '#myModal',
            service = this;  // alias for the modal service itself

        /**
        * A flag indicating whether the modal is visible or not
        * @property visible
        * @type Boolean
        * @default false
        */
        this.visible = false;

        /**
        * Make modal visible.
        *
        * @method show
        * @param opt {Object} Object containing modal options.
        *   @param [opt.title] {String} Title of the modal box.
        *   @param opt.templateUrl {String} URL of modal's HTML template.
        *   @param opt.windowClass {String} Class of modal window.
        */
        this.show = function (opt) {
            this.title = opt.title;
            // could also be undefined
            this.url = opt.templateUrl;
            this.windowClass = 'large';
            if (opt.windowClass !== undefined) {
                this.windowClass = opt.windowClass;
            }

            opt.backdrop = 'static';
            opt.keyboard = false;
            opt.show = true;

            $(selector).modal(opt);
            service.visible = true;
        };

        /**
        * Make modal invisible.
        *
        * @method hide
        */
        this.hide = function () {
            this.visible = false;
            $(selector).modal('hide');
        };
    }
]);
