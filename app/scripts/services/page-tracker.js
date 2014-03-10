'use strict';

/**
* AngularJS Service for tracking which batches of content have been loaded
* from the backend server. Useful when implementing pagination behavior.
*
* @class pageTracker
*/
angular.module('authoringEnvironmentApp')
    .service('pageTracker', function PageTracker() {

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
        this.isLastPage = function(pagination) {
            if (typeof pagination == 'undefined') {
                // when a resource is all contained in one page, there
                // is no `pagination` property in the returned object
                return true;
            }
            ['itemsPerPage', 'currentPage', 'itemsCount'].map(function(field) {
                pagination[field] = parseInt(pagination[field], 10);
            });
            var pages = pagination.itemsCount / pagination.itemsPerPage;
            return pagination.currentPage >= pages;
        };

        /**
        * Creates and returns a new tracker object.
        *
        * @method getTracker
        * @param [opt] {Object} not used
        * @return {Object} New tracker object.
        */
        this.getTracker = function(opt) {
            // XXX: is there any reason to keep the opt parameter? Seems like
            // it's not used anymore, therefore it should be safe to remove it?

            /**
            * @class tracker
            */
            return {
                /**
                * A value 1 higher that the current highest page index in pages
                * list. Can be thought of as a future index of the newest
                * retrieved page.
                * @property counter
                * @type Number
                * @default 1
                */
                counter: 1,

                /**
                * List of page indices of those pages (batches of items)
                * that have been retrieved from the server. If a particular
                * index does not exist, it means that the corresponding page
                * has not been loaded.
                *
                * @property pages
                * @type Object
                * @default {}
                */
                pages: {},

                /**
                * Removes a page from the list of retrieved pages. Useful when
                * we need to mark a page as "not loaded", e.g. when server
                * reports an error.
                * @method remove
                * @param page {Number} Page index (NOTE: indices start with 1).
                */
                remove: function(page) {
                    delete this.pages[page];
                },

                /**
                * Checks if a page is on the list of pages that have been
                * retrieved from the server.
                *
                * @method has
                * @param page {Number} Page index (NOTE: indices start with 1).
                * @return {Boolean} true if page is on the list,
                *   otherwise false
                */
                has: function(page) {
                    return page in this.pages;
                },

                /**
                * Finds the lowest page index of a page that is not marked as
                * retrieved, marks this page as retrieved and returns its
                * index. Also, if the index is greater than any of the existing
                * retrieved page indices, it advances counter by one.
                *
                * @method next
                * @return {Number} Index of the page now marked as retrieved.
                */
                next: function() {
                    for(var i=1; i<=this.counter; i++) {
                        if (this.has(i) == false) {
                            this.pages[i] = true;
                            if (i == this.counter) {
                                this.counter++;
                            };
                            return i;
                        }
                    }
                }
            }
        };
    });
