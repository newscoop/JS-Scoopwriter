'use strict';

/**
* AngularJS Service for displaying a modal box (overlay) on a page.
*
* @class modal
*/
angular.module('authoringEnvironmentApp')
    .service('modal',
             ['$templateCache', '$log', '$http',
              function modal($templateCache, $log, $http) {
        // AngularJS will instantiate a singleton by calling "new" on this function

        // jQuery selector for the modal's root DOM element
        var selector = '#myModal';

        var service = this;  // alias for the modal service itself

        /**
        * A flag indicating whether the modal is visible or not
        * @property visible
        * @type Boolean
        * @default false
        */
        this.visible = false;

        // Object {title: "Attach Image", templateUrl: "views/attach-image.html"}

        /**
        * Make modal visible.
        *
        * @method show
        * @param opt {Object} Object containing modal options.
        *   @param [opt.title] {String} Title of the modal box.
        *   @param opt.templateUrl {String} URL of modal's HTML template.
        */
        this.show = function(opt) {
            this.title = opt.title; // could also be undefined
            this.url = opt.templateUrl;
            $(selector).modal('show');
            service.visible = true;
        };

        /**
        * Make modal invisible.
        *
        * @method hide
        */
        this.hide = function() {
            this.visible = false;
            $(selector).modal('hide');
        };
    }]);
