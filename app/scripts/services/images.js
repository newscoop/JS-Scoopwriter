'use strict';

angular.module('authoringEnvironmentApp')
    .service('images', ['$http', 'pageTracker', function images($http, pageTracker) {
        /* more info about the page tracker in its tests */
        // AngularJS will instantiate a singleton by calling "new" on this function
        var service = this;
        this.tracker = pageTracker.getTracker({max: 100});
        this.loaded = [];
        this.displayed = [];
        this.attached = [];
        /* at the beginning we want do display the results immediately */
        this.init = function() {
            this.load(this.tracker.next())
                .success(function(data) {
                    service.displayed = data.items;
                    /* prepare the next batch, for an happy user */
                    service.more();
                })
        };
        /* synchronously show more items and asynchronously ask for loading */
        this.more = function() {
            var additional = service.loaded.splice(0, 10);
            this.displayed = this.displayed.concat(additional);
            this.load(this.tracker.next())
                .success(function(data) {
                    service.loaded = service.loaded.concat(data.items);
                })
        };
        this.load = function(page) {
            var url = '/api/images?page=' + page;
            var promise = $http.get(url);
            promise.error(function() {
                service.tracker.remove(page);
            });
            return promise;
        };
        this.attach = function(id) {
            function same(noodle) {
                return parseInt(noodle.id) == parseInt(id);
            };
            if (_.find(this.attached, same)) {
                // already attached, do nothing
                return;
            } else {
                var i = _.cloneDeep(_.find(this.displayed, same));
                i.incomplete = true;
                this.attached.push(i);
                this.updateAttached();
            }
        };
        this.updateAttached = function() {
            this.attached.forEach(function(a) {
                if (a.incomplete) {
                    $http
                        .get('/api/images/' + a.id)
                        .success(function(data) {
                            _.forOwn(data, function(value, key) {
                                if (!(key in a)) {
                                    a[key] = value;
                                }
                            });
                            a.incomplete = false;
                        });
                }
            });
        };
    }]);
