'use strict';

angular.module('authoringEnvironmentApp')
    .service('images', ['$http', function images($http) {
        // AngularJS will instantiate a singleton by calling "new" on this function
        var service = this;
        this.loaded = [];
        this.displayed = [];
        this.attached = [];
        this.pagination = {
            currentPage: '0'
        };
        /* synchronously show more items and asynchronously ask for loading */
        this.more = function() {
            var additional = service.loaded.splice(0, 10);
            this.displayed = this.displayed.concat(additional);
            this.load(service.pagination.currentPage);
        };
        this.load = function(page) {
            var url = '/api/images?page=' + (parseInt(page) + 1);
            $http
                .get(url)
                .success(function(data) {
                    /* if the page was changed, somebody already
                     * loaded this data, discarding our copy */
                    if (page != service.pagination.currentPage) {
                        return;
                    } else {
                        service.loaded = service.loaded.concat(data.items);
                        service.pagination = data.pagination;
                    }
                });
        };
        this.attach = function(id) {
            this.attached.push(_.find(service.displayed, function(noodle) {
                return noodle.id == id;
            }));
        };
    }]);
