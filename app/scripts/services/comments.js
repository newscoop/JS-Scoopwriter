'use strict';

angular.module('authoringEnvironmentApp')
    .service('comments', ['configuration', 'article', '$http', '$q', '$resource', 'transform', function comments(configuration, article, $http, $q, $resource, transform) {
        var service = this;
        var f = configuration.API.full;
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
                }
            });
        this.displayed = [];
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
            this.load(1).then(function(data){
                service.displayed = data.items.map(decorate);
            });
        };
        this.load = function(page) {
            var deferred = $q.defer();
            article.promise.then(function (article) {
                var url = configuration.API.full +
                    '/comments/article/' + article.number +
                    '/' + article.language +
                    '?page=' + page;
                $http.get(url).success(function(data) {
                    deferred.resolve(data);
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
