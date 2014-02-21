'use strict';

angular.module('authoringEnvironmentApp')
    .service('pageTracker', function PageTracker() {
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
        // AngularJS will instantiate a singleton by calling "new" on this function
        this.getTracker = function(opt) {
            return {
                counter: 1,
                pages: {},
                remove: function(page) {
                    delete this.pages[page];
                },
                has: function(page) {
                    return page in this.pages;
                },
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
