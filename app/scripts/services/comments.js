'use strict';

/**
* AngularJS Service for managing article comments.
*
* @class comments
*/
angular.module('authoringEnvironmentApp')
    .service('comments', ['configuration', 'article', '$http', '$q', '$resource', 'transform', 'pageTracker', '$log', 'nestedSort', function comments(configuration, article, $http, $q, $resource, transform, pageTracker, $log, nestedSort) {
        var service = this;     // alias for the comments service itself
        var f = configuration.API.full;  // base API URL
        /* max number of comments per page, decrease it in order to
         * test pagination, and sorting change with paginated
         * comments */
        var itemsPerPage = 50;
        var sorting = 'nested';

        /**
        * A flag indicating whether there are more comments to be loaded.
        * @property canLoadMore
        * @type Boolean
        * @default true
        */
        this.canLoadMore = true;

        /**
        * A list of all comments loaded so far.
        * @property loaded
        * @type Array
        * @default []
        */
        this.loaded = [];

        /**
        * A list of currently displayed comments.
        * @property displayed
        * @type Array
        * @default []
        */
        this.displayed = [];

        /**
        * Helper service for tracking which comments pages have been loaded.
        * @property tracker
        * @type Object (instance of pageTracker)
        */
        this.tracker = pageTracker.getTracker();

        /**
        * Helper object for communication with the backend API.
        * @property tracker
        * @type Object (as created by Angular's $resource factory)
        */
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

        /**
        * Asynchronously adds a new comment and displays it after it has been
        * successfully stored on the server.
        *
        * @method add
        * @param par {Object} A wrapper around the object containing
        *   comment data. As such it can be directly passed to the relevant
        *   method of this.resource object.
        *   @param par.comment {Object} The actual object with comment data.
        *     @param par.comment.subject {String} Comment's subject
        *     @param par.comment.message {String} Comment's body
        *     @param [par.comment.parent] {Number} ID of the parent comment
        * @return {Object} A promise object
        */
        this.add = function(par) {
            var deferred = $q.defer();
            article.promise.then(function(article) {
                service.resource.create({
                    articleNumber: article.number,
                    languageCode: article.language
                }, par, function(data, headers) {
                    var url = headers('X-Location');
                    if (url) {
                        $http.get(url).success(function (data) {
                            // just add the new comment to the end and filters
                            // will take care of the correct ordering
                            service.displayed.push(decorate(data));
                            nestedSort.sort(service.displayed);
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

        /**
        * Initializes all internal variables to their default values, then
        * loads and displays the first batch of article comments.
        *
        * @method init
        */
        this.init = function(opt) {
            // XXX: from user experience perspective current behavior might
            // not be ideal (to reload everything, e.g. after adding a new
            // comment), but for now we stick with it as a reasonable
            // compromise between UX and complexity of the logic in code
            service.tracker = pageTracker.getTracker();
            service.canLoadMore = true;
            service.loaded = [];
            service.displayed = [];
            if(opt && opt.sorting) {
                sorting = opt.sorting;
            } else {
                sorting = 'nested';
            }

            this.load(this.tracker.next()).then(function(data){
                service.displayed = data.items.map(decorate);
                nestedSort.sort(service.displayed);
                if (service.canLoadMore) {
                    // prepare the next batch
                    service.load(service.tracker.next()).then(function(data) {
                        service.loaded = service.loaded.concat(data.items);
                    });
                }
            });
        };

        /**
        * If there are more comments to be loaded from the server, the method
        * first takes one page of comments from the pre-loaded comments list
        * and appends them to the end of the displayed comments list. After
        * that it also asynchronously loads the next page of comments from
        * the server.
        *
        * @method more
        */
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

        /**
        * Asynchronously loads a single page of article comments.
        *
        * @method load
        * @param page {Number} Index of the page to load
        *     (NOTE: page indices start with 1)
        * @return {Object} A promise object
        */
        this.load = function(page) {
            var deferred = $q.defer();
            article.promise.then(function (article) {
                if (sorting == 'nested') {
                    var sortingPart = '/nested';
                } else {
                    var sortingPart = '';
                }
                var url = [
                    configuration.API.full,
                    '/comments/article/',
                    article.number,
                    '/',
                    article.language,
                    sortingPart,
                    '?items_per_page=',
                    itemsPerPage,
                    '&page=',
                    page
                ].join('');
                $http.get(url).success(function(data) {
                    deferred.resolve(data);
                    if (pageTracker.isLastPage(data.pagination)) {
                        service.canLoadMore = false;
                    }
                }).error(function () {
                    // in case of failure remove the page from the tracker
                    service.tracker.remove(page);
                });
            });
            return deferred.promise;
        };

        /**
        * Creates and returns a comparison function. This functions accepts an
        * object with the "id" attribute as a parameter and returns true if
        * object.id is equal to the value of the "id" parameter passed to
        * the method. If not, the created comparison function returns false.
        *
        * The returned comparison function can be used, for instance, as a
        * parameter to various utility functions - one example would be
        * a function, which filters given array based on some criteria.
        *
        * @method matchMaker
        * @param id {Number} Value to which the object.id will be compared in
        *   the comparison function (can also be a numeric string).
        *   NOTE: before comparison the parameter is converted to integer
        *   using the built-in parseInt() function.
        *
        * @return {Function} Generated comparison function.
        */
        this.matchMaker = function(id) {
            return function(needle) {
                return parseInt(needle.id) == parseInt(id);
            };
        };

        /**
        * Decorates an object containing raw comment data (as returned by
        * the API) with properties and methods, turning it into a
        * self-contained "comment entity", which knows how to manage itself
        * (e.g. editing, saving, removing...)
        *
        * @class decorate
        * @param comment {Object} Object containing comment's (meta)data
        * @return {Object} Decorated comment object
        */
        function decorate(comment) {
            /**
            * @class comment
            */

            /**
            * How the comment is currently displayed (collapsed or expanded).
            * @property showStatus
            * @type String
            * @default "collapsed"
            */
            comment.showStatus = 'collapsed';

            /**
            * A flag indicating whether the comment is currently being edited.
            * @property isEdited
            * @type Boolean
            * @default false
            */
            comment.isEdited = false;

            /**
            * Object holding a subject and a message of the new reply to
            * the comment.
            *
            * @property reply
            * @type Object
            * @default {subject: 'Re: <comment-subject>', message: ''}
            */
            comment.reply = {
                subject: 'Re: ' + comment.subject,
                message: ''
            };

            /**
            * A flag indicating whether or not a reply-to-comment mode is
            * currently active.
            *
            * @property isReplyMode
            * @type Boolean
            * @default false
            */
            comment.isReplyMode = false;

            /**
            * A flag indicating whether or not a reply is currently being
            * sent to the server.
            *
            * @property sendingReply
            * @type Boolean
            * @default false
            */
            comment.sendingReply = false;

            /**
            * Sets comment's display status to collapsed.
            * @method collapse
            */
            comment.collapse = function() {
                this.showStatus = 'collapsed';
                this.isReplyMode = false;
            };

            /**
            * Sets comment's display status to expanded.
            * @method expand
            */
            comment.expand = function() {
                this.showStatus = 'expanded';
            };

            /**
            * Changes comment's display status from expanded to collapsed or
            * vice versa.
            * @method toggle
            */
            comment.toggle = function() {
                if ('expanded' == this.showStatus) {
                    this.collapse();
                } else {
                    this.expand();
                }
            };

            /**
            * Puts comment into edit mode.
            * @method edit
            */
            comment.edit = function() {
                this.editing = {
                    subject: this.subject,
                    message: this.message
                };
                this.isEdited = true;
                this.isReplyMode = false;
            };

            /**
            * End comment's edit mode.
            * @method cancel
            */
            comment.cancel = function() {
                this.isEdited = false;
            };

            /**
            * Asynchronously saves/updates the comment and ends the edit mode.
            * @method save
            */
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

            /**
            * Asynchronously deletes the comment.
            * @method remove
            */
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

            /**
            * Enters into reply-to-comment mode.
            * @method replyTo
            */
            comment.replyTo = function () {
                comment.isReplyMode = true;
            };

            /**
            * Exits from reply-to-comment mode.
            * @method cancelReply
            */
            comment.cancelReply = function () {
                comment.isReplyMode = false;
            };

            /**
            * Asynchronously adds a new reply to the comment and displays it
            * after successfully storing it on the server.
            * @method sendReply
            */
            comment.sendReply = function () {
                var comment = this,  // alias for the comment object itself
                    replyData = angular.copy(comment.reply);

                replyData.parent = comment.id;
                comment.sendingReply = true;

                service.add({'comment': replyData}).then(function () {
                    comment.sendingReply = false;
                    comment.isReplyMode = false;
                    comment.reply = {
                        subject: 'Re: ' + comment.subject,
                        message: ''
                    };
                });
            };

            return comment;
        }
    }]);
