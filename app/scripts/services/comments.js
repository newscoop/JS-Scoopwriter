'use strict';

angular.module('authoringEnvironmentApp')
    .service('comments', ['configuration', 'article', '$http', '$q', '$resource', 'transform', 'pageTracker', '$log', function comments(configuration, article, $http, $q, $resource, transform, pageTracker, $log) {
        var service = this;
        var f = configuration.API.full;
        var itemsPerPage = 50;
        this.canLoadMore = true;
        this.loaded = [];
        this.displayed = [];
        this.tracker = pageTracker.getTracker();
        this.resource = $resource(
            f + '/comments/article/:articleNumber/:languageCode', {
            }, {
                create: {
                    method: 'POST',
                    transformRequest: transform.formEncode
                },
                save: {
                    method: 'POST',
                    url: f + '/comments/article/:articleNumber/:languageCode/:commentId',
                    transformRequest: transform.formEncode
                },
                delete: {
                    method: 'DELETE',
                    url: f + '/comments/article/:articleNumber/:languageCode/:commentId'
                }
            });
        this.add = function(par) {
            var deferred = $q.defer();
            article.promise.then(function(article) {
                service.resource.create({
                    articleNumber: article.number,
                    languageCode: article.language
                }, par, function(data, headers) {
                    var url = headers('X-Location');
                    if (url) {
                        $http.get(url).success(function(data) {
                            service.displayed.push(decorate(data));
                        });
                    } else {
                        // the header may not be available if the server
                        // is on a different domain (we are in this
                        // situation at the beginning of dev) and it is
                        // not esplicitely enabled
                        // http://stackoverflow.com/a/18178524/393758
                        service.init();
                    }
                    deferred.resolve();
                });
            });
            return deferred.promise;
        };
        this.init = function() {
            // reset everything to initial state (set back to default
            // values) and load article comments.
            //
            // XXX: from user experience perspective this might not be
            // ideal (to reload everything, e.g. after adding a new comment),
            // but for now we stick with that as a reasonable compromise
            // between UX and complexity of the logic in code
            service.tracker = pageTracker.getTracker();
            service.canLoadMore = true;
            service.loaded = [];
            service.displayed = [];

            this.load(this.tracker.next()).then(function(data){
                service.displayed = data.items.map(decorate);
                if (service.canLoadMore) {
                    // prepare the next batch
                    service.load(service.tracker.next()).then(function(data) {
                        service.loaded = service.loaded.concat(data.items);
                    });
                };
            });
        };
        this.more = function() {
            if (this.canLoadMore) {
                var additional = this.loaded.splice(0, itemsPerPage);
                additional = additional.map(decorate);
                this.displayed = this.displayed.concat(additional);
                var next = this.tracker.next();
                this.load(next).then(function(data) {
                    service.loaded = service.loaded.concat(data.items);
                });
            } else {
                $log.error('More comments required, but the service cannot load more of them. In this case the user should not be able to trigger this request');
            }
        };
        this.load = function(page) {
            var deferred = $q.defer();
            article.promise.then(function (article) {
                var url = configuration.API.full +
                    '/comments/article/' + article.number +
                    '/' + article.language +
                    '?items_per_page=' + itemsPerPage +
                    '&page=' + page;
                $http.get(url).success(function(data) {
                    deferred.resolve(data);
                    if (pageTracker.isLastPage(data.pagination)) {
                        service.canLoadMore = false;
                    }
                }, function() {
                    // in case of failure remove the page from the tracker
                    service.tracker.remove(page);
                });
            });
            return deferred.promise;
        };
        this.matchMaker = function(id) {
            return function(needle) {
                return parseInt(needle.id) == parseInt(id);
            };
        };

        function decorate(comment) {
            comment.showStatus = 'collapsed';
            comment.collapse = function() {
                this.showStatus = 'collapsed';
            };
            comment.expand = function() {
                this.showStatus = 'expanded';
            };
            comment.toggle = function() {
                if ('expanded' == this.showStatus) {
                    this.collapse();
                } else {
                    this.expand();
                }
            };

            comment.isEdited = false;
            comment.edit = function() {
                this.editing = {
                    subject: this.subject,
                    message: this.message
                };
                this.isEdited = true;
            };
            comment.cancel = function() {
                this.isEdited = false;
            };
            comment.save = function() {
                var comment = this;
                article.promise.then(function(article) {
                    service.resource.save({
                        articleNumber: article.number,
                        languageCode: article.language,
                        commentId: comment.id
                    }, {comment: comment.editing}, function() {
                        comment.subject = comment.editing.subject;
                        comment.message = comment.editing.message;
                        comment.isEdited = false;
                    });
                });
            };

            comment.remove = function() {
                var comment = this;
                article.promise.then(function(article) {
                    service.resource.delete({
                        articleNumber: article.number,
                        languageCode: article.language,
                        commentId: comment.id
                    }).$promise.then(function() {
                        _.remove(
                            service.displayed,
                            service.matchMaker(comment.id)
                        );
                    });
                });
            };
            return comment;
        };
    }]);
