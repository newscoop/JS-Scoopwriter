'use strict';

/**
* AngularJS Service for managing article comments.
*
* @class editorialComments
*/
angular.module('authoringEnvironmentApp').service('editorialComments', [
    'article',
    '$http',
    '$q',
    'transform',
    'pageTracker',
    '$log',
    function(articleService, $http, $q, transform, pageTracker, $log) {

    var article = articleService.articleInstance,
        itemsPerPage = 50,
        latestPage = 1,
        self = this,
        sorting = 'nested';

        /**
        * A flag indicating whether there are more comments to be loaded.
        * @property canLoadMore
        * @type Boolean
        * @default false
        */
        self.canLoadMore = false;

        /**
        * A list of all comments loaded so far.
        * @property loaded
        * @type Array
        * @default []
        */
        self.loaded = [];

        /**
        * A list of all comments fetched so far.
        * @property fetched
        * @type Array
        * @default []
        */
        self.fetched = [];

        /**
        * A list of currently displayed comments.
        * @property displayed
        * @type Array
        * @default []
        */
        self.displayed = [];

        /**
        * Helper service for tracking which comments pages have been loaded.
        * @property tracker
        * @type Object (instance of pageTracker)
        */
        self.tracker = pageTracker.getTracker();

        /**
        * Initializes all internal variables to their default values, then
        * loads and displays the first batch of article comments.
        *
        * @method init
        */
        self.init = function () {
            var deferredGet = $q.defer();

            self.tracker = pageTracker.getTracker();
            self.loaded = [];
            self.fetched = [];
            self.canLoadMore = false;
            sorting = 'nested';

            self.getAllByPage(self.tracker.next()).then(function (data) {
                if (self.displayed.length === 0) {
                    self.displayed = data.items.map(decorate);
                }

                self.fetched = data.items.map(decorate);
                createComments();
                deferredGet.resolve();
                if (self.canLoadMore) {
                    // prepare the next batch
                    self.getAllByPage(self.tracker.next()).then(
                        function (response) {
                            self.loaded = self.loaded.concat(response.items);
                        }
                    );
                }
            }, function() {
                deferredGet.reject();
            });

            return deferredGet.promise;
        };

        function createComments() {
            if (self.displayed.length > self.fetched.length) {
                self.displayed = _.difference(self.fetched, self.displayed);
            } else {
                for (var i = 0; i < self.fetched.length; i++) {
                    var found = false;
                    for (var j = 0; j < self.displayed.length; j++) {
                        if (self.displayed[j].id === self.fetched[i].id) {
                            found = true;
                            break;
                        }
                    }

                    if (found &&
                        (self.displayed[i]
                            .comment !== self.fetched[i].comment)) {
                        self.displayed[i] = self.fetched[i];
                    }

                    if (!found) {
                        self.displayed.splice(i, 0, self.fetched[i]);
                    }
                }
            }
        }

        /**
        * If there are more comments to be loaded from the server, the method
        * first takes one page of comments from the pre-loaded comments list
        * and appends them to the end of the displayed comments list. After
        * that it also asynchronously loads the next page of comments from
        * the server.
        *
        * @method more
        */
        self.more = function () {
            if (self.canLoadMore) {
                var additional = self.loaded.splice(0, itemsPerPage);
                additional = additional.map(decorate);
                self.displayed = self.displayed.concat(additional);
                var next = self.tracker.next();
                latestPage = next;
                self.getAllByPage(next - 1).then(function (response) {
                    self.canLoadMore = false;
                    if (response.items.length > 0) {
                        self.canLoadMore = true;
                    }

                    self.loaded = self.loaded.concat(response.items);
                });
            } else {
                $log.error(
                    'More comments required, but the service cannot ' +
                    'load more of them. In this case the user should not ' +
                    'be able to trigger this request'
                );
            }
        };

        /**
        * Retrieves a list of all editorial comment assigned to
        * a specific article.
        *
        * Initially, an empty array is returned, which is later filled with
        * data on successful server response. At that point the given promise
        * is resolved.
        *
        * @method getAllByPage
        * @param page {Number} Page number
        * @return {Object} Editorial comments
        */
        self.getAllByPage = function (page) {
            var deferredGet = $q.defer(),
                url;

            var totalPerPage = itemsPerPage * latestPage;
            itemsPerPage = totalPerPage;
            if (self.displayed.length > 0) {
                itemsPerPage = totalPerPage -
                    (totalPerPage - self.displayed.length);
            }

            url = Routing.generate(
                'newscoop_gimme_articles_get_editorial_comments',
                {
                    language: article.language,
                    number: article.articleId,
                    order: sorting,
                    items_per_page: itemsPerPage,
                    page: page
                },
                true
            );

            $http.get(url)
                .then(function (response) {
                var responseData = response.data;
                deferredGet.resolve(responseData);
                if (responseData.items.length > 0 ||
                    responseData.pagination !== undefined) {
                    self.canLoadMore = true;
                }

                if (responseData.items.length > 0 &&
                    responseData.pagination === undefined) {
                    self.canLoadMore = false;
                }
            }, function (responseBody) {
                // in case of failure remove the page from the tracker
                self.tracker.remove(page);
            });

            return deferredGet.promise;
        };

        /**
        * Asynchronously adds a new comment and displays it after it has been
        * successfully stored on the server.
        *
        * @method add
        * @param parameters {Object} A wrapper around the object containing
        *   comment data.
        *   @param parameters.editorial_comment {Object} The actual object
        *   with comment data.
        *     @param [parameters.editorial_comment.comment] {String} Comment's
        *     body
        *     @param [parameters.editorial_comment.parent] {Number} ID of the
        *     parent comment
        * @return {Object} A promise object
        */
        self.add = function (parameters) {
            var deferred = $q.defer(),
                url;

            url = Routing.generate(
                'newscoop_gimme_articles_create_editorial_comment',
                {
                    number: article.articleId,
                    language: article.languageData.id
                },
                true
            );

            $http.post(
                url,
                parameters,
                {transformRequest: transform.formEncode}
            ).then(function (response) {
                var resourceUrl = response.headers('x-location');
                if (resourceUrl) {
                    $http.get(resourceUrl).then(function (response) {
                        var responseData = response.data;
                        if (responseData.parent === undefined) {
                            self.displayed.push(decorate(responseData));
                        }

                        deferred.resolve(decorate(responseData));
                    });
                } else {
                    // the header may not be available if the server
                    // is on a different domain (we are in this
                    // situation at the beginning of dev) and it is
                    // not esplicitely enabled
                    // http://stackoverflow.com/a/18178524/393758
                    self.init();
                }
            }, function () {
                deferred.reject();
            });

            return deferred.promise;
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
            * A flag indicating whether the comment is marked as
            * resolved or not.
            * @property resolved
            * @type Boolean
            */
            comment.resolved = !!comment.resolved;  // to Boolean

            /**
            * An object holding comment properties yet to be saved on
            *   the server
            * @property editing
            */
            comment.editing = {};

            /**
            * Object holding a subject and a message of the new reply to
            * the comment.
            *
            * @property reply
            * @type Object
            * @default {subject: 'Re: <comment-subject>', message: ''}
            */
            comment.reply = {
                comment: ''
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
            * A flag indicating whether or not a comment is currently being
            * resolved.
            *
            * @property resolving
            * @type Boolean
            * @default false
            */
            comment.resolving = false;

            /**
            * Sets comment's display status to collapsed.
            * @method collapse
            */
            comment.collapse = function () {
                this.showStatus = 'collapsed';
                this.isReplyMode = false;
            };

            /**
            * Sets comment's display status to expanded.
            * @method expand
            */
            comment.expand = function () {
                this.showStatus = 'expanded';
            };

            /**
            * Changes comment's display status from expanded to collapsed or
            * vice versa.
            * @method toggle
            */
            comment.toggle = function () {
                if ('expanded' === this.showStatus) {
                    this.collapse();
                } else {
                    this.expand();
                }
            };

            /**
            * Puts comment into edit mode.
            * @method edit
            */
            comment.edit = function () {
                this.editing.comment = this.comment;
                this.isEdited = true;
                this.isReplyMode = false;
            };

            /**
            * End comment's edit mode.
            * @method cancel
            */
            comment.cancel = function () {
                this.isEdited = false;
            };

            /**
            * Asynchronously saves/updates the comment and ends the edit mode.
            * @method save
            */
            comment.save = function () {
                var comment = this,
                    deferred = $q.defer(),
                    url;

                url = Routing.generate(
                    'newscoop_gimme_articles_edit_editorial_comment',
                    {
                        number: article.articleId,
                        language: article.languageData.id,
                        commentId: comment.id
                    },
                    true
                );

                $http.post(
                    url,
                    {editorial_comment: comment.editing},
                    {transformRequest: transform.formEncode}
                ).then(function () {
                    deferred.resolve();
                    comment.comment = comment.editing.comment;
                    comment.isEdited = false;
                }, function () {
                    deferred.reject();
                });

                return deferred.promise;
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
            * Asynchronously toggle the comment between being and not-being
            * marked as resolved.
            * @method toggleResolved
            */
            comment.toggleResolved = function () {
                var comment = this,
                    deferred = $q.defer(),
                    url;

                url = Routing.generate(
                    'newscoop_gimme_articles_edit_editorial_comment',
                    {
                        number: article.articleId,
                        language: article.languageData.id,
                        commentId: comment.id
                    },
                    true
                );

                comment.resolving = true;

                $http.post(
                    url,
                    {editorial_comment: {resolved: true}},
                    {transformRequest: transform.formEncode}
                ).then(function () {
                    removeCommentWithChildren(comment.id);
                    deferred.resolve();
                    comment.resolving = false;
                }, function (responseBody) {
                    deferred.reject(responseBody);
                });

                return deferred.promise;
            };

            /**
            * Asynchronously adds a new reply to the comment and displays it
            * after successfully storing it on the server.
            * @method sendReply
            */
            comment.sendReply = function () {
                var comment = this,
                    deferred = $q.defer(),
                    replyData;

                replyData = angular.copy(comment.reply);
                replyData.parent = comment.id;
                comment.sendingReply = true;

                self.add({ 'editorial_comment': replyData })
                .then(function (data) {
                    addChildComment(replyData.parent, data);
                    comment.sendingReply = false;
                    comment.isReplyMode = false;
                    comment.reply = {
                        comment: ''
                    };

                    deferred.resolve();
                }, function () {
                    deferred.reject();
                });

                return deferred.promise;
            };

            return comment;
        }

        /**
         * Updates comments array. It adds a new comment to the array
         * of the comments.
         *
         * @param  {integer} parentId      Parent comment id
         * @param  {object}  newComment    Newly inserted comment object
         */
        function addChildComment(parentId, newComment) {
            var index = 0;
            for (var i = 0; i < self.displayed.length; i++) {
                if (self.displayed[i].parent &&
                    self.displayed[i].parent.id === parentId) {
                    index = self.displayed.indexOf(
                        self.displayed[i]
                    );
                }
            }

            index = index + 1;
            // add it as first child of the parent comment
            if (index === 1) {
              for (var j = 0; j < self.displayed.length; j++) {
                  if (self.displayed[j].id === parentId) {
                    index = self.displayed.indexOf(
                        self.displayed[j]
                    ) + 1;
                  }
              }
            }

            self.displayed.splice(index, 0, newComment);
        }

        /**
         * Removes comment and its children from the array
         * of not resolved comments.
         *
         * @param  {integer} id comment id
         */
        function removeCommentWithChildren(id) {
            var removeComments = [];
            for (var i = 0; i < self.displayed.length; i++) {
                if (self.displayed[i].id === id ||
                    (self.displayed[i].parent &&
                        self.displayed[i].parent.id === id)) {
                    removeComments.push(self.displayed[i]);
                }
            }

            for (var j = 0; j < removeComments.length; j++) {
                self.displayed.splice(
                    self.displayed.indexOf(removeComments[j]),
                    1
                );
            }
        }
}]);