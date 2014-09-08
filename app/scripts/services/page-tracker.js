'use strict';

/**
* AngularJS Service for tracking which batches of content have been loaded
* from the backend server. Useful when implementing pagination behavior.
*
* @class pageTracker
*/
angular.module('authoringEnvironmentApp').service('pageTracker', function () {

    /**
    * Examines the given pagination object and determine, whether it
    * represents the last page of items or not.
    *
    * @method isLastPage
    * @param pagination {Object} Object containing pagination metadata.
    *   @param pagination.currentPage {Number} Index of the current page
    *     (NOTE: page indices start with 1).
    *   @param pagination.itemsCount {Number} Total number of items
    *     available.
    *   @param pagination.itemsPerPage {Number} Maximum number of items
    *     per page.
    *   @param [pagination.nextPageLink] {String} URL of the next batch of
    *     items. Undefined for the last page.
    *   @param [pagination.previousPageLink] {String} URL of the previous
    *     batch of items. Undefined for the first page.
    *
    * @return {Boolean} true if last page, otherwise false
    */
    this.isLastPage = function (pagination) {
        if (typeof pagination === 'undefined') {
            // when a resource is all contained in one page, there
            // is no `pagination` property in the returned object
            return true;
        }
        [
            'itemsPerPage',
            'currentPage',
            'itemsCount'
        ].map(function (field) {
            pagination[field] = parseInt(pagination[field], 10);
        });
        var pages = pagination.itemsCount / pagination.itemsPerPage;
        return pagination.currentPage >= pages;
    };

    /**
    * Creates and returns a new tracker object.
    *
    * @method getTracker
    * @return {Object} New tracker object.
    */
    this.getTracker = function (opt) {
        /**
        * @class tracker
        */
        return {
            counter: 1,
            pages: {},
            remove: function (page) {
                delete this.pages[page];
            },
            has: function (page) {
                return page in this.pages;
            },
            next: function () {
                for (var i = 1; i <= this.counter; i++) {
                    if (this.has(i) === false) {
                        this.pages[i] = true;
                        if (i === this.counter) {
                            this.counter++;
                        }
                        return i;
                    }
                }
            },
            reset: function () {
                this.pages = {};
                this.counter = 1;
            }
        };
    };
});
