'use strict';

angular.module('authoringEnvironmentApp')
    .service('pageTracker', function PageTracker() {
        // AngularJS will instantiate a singleton by calling "new" on this function
        this.getTracker = function(opt) {
            return {
                pages: {},
                remove: function(page) {
                    delete this.pages[page];
                },
                has: function(page) {
                    return page in this.pages;
                },
                next: function() {
                    for(var i=1; i<=opt.max; i++) {
                        if (this.has(i) == false) {
                            this.pages[i] = true;
                            return i;
                        }
                    }
                    return 'none';
                }
            }
        };
    });
