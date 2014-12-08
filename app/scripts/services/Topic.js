'use strict';

/**
* A factory which creates an article topic model.
*
* @class Topic
*/
angular.module('authoringEnvironmentApp').factory('Topic', [
    '$http',
    '$q',
    '$timeout',
    'dateFactory',
    'pageTracker',
    function ($http, $q, $timeout, dateFactory, pageTracker) {
        var SEARCH_DELAY_MS = 250,  // after the last search term change
            lastContext = null,  // most recent live search context
            lastTermChange = 0,  // time of the most recent search term change
            Topic = function () {};  // topic constructor

        /**
        * Converts raw data object to a Topic instance.
        *
        * @method createFromApiData
        * @param data {Object} raw object containing topic data
        * @return {Object} created Topic instance
        */
        Topic.createFromApiData = function (data) {
            var topic = new Topic();

            topic.id = parseInt(data.id);
            topic.title = data.title;
            topic.parentId = parseInt(data.parent);
            topic.level = parseInt(data.level);
            topic.order = parseInt(data.order);

            // display text ... this property is expected by the select2 search
            // widget for all results
            topic.text = topic.title;

            return topic;
        };

        /**
        * Retrieves a list of all existing topics.
        *
        * Initially, an empty array is returned, which is later filled with
        * data on successful server response. At that point the given promise
        * is resolved (exposed as a $promise property of the returned array).
        *
        * @method getAll
        * @return {Object} array of topics
        */
        Topic.getAll = function () {
            var topics = [],
                deferredGet = $q.defer(),
                url;

            topics.$promise = deferredGet.promise;

            url = Routing.generate(
                'newscoop_gimme_topics_gettopics',
                {items_per_page: 9999},  // de facto "all"
                true
            );

            $http.get(url)
            .success(function (response) {
                response.items.forEach(function (item) {
                    item = Topic.createFromApiData(item);
                    topics.push(item);
                });
                deferredGet.resolve();
            }).error(function (responseBody) {
                deferredGet.reject(responseBody);
            });

            return topics;
        };

        /**
        * Retrieves a list of all topics assigned to a specific article.
        *
        * Initially, an empty array is returned, which is later filled with
        * data on successful server response. At that point the given promise
        * is resolved (exposed as a $promise property of the returned array).
        *
        * @method getAllByArticle
        * @param number {Number} article ID
        * @param language {String} article language code, e.g. 'de'
        * @return {Object} array of article topics
        */
        Topic.getAllByArticle = function (number, language) {
            var topics = [],
                deferredGet = $q.defer(),
                url;

            topics.$promise = deferredGet.promise;

            url = Routing.generate(
                'newscoop_gimme_topics_getarticlestopics',
                {number: number, language: language},
                true
            );

            $http.get(url)
            .success(function (response) {
                response.items.forEach(function (item) {
                    item = Topic.createFromApiData(item);
                    topics.push(item);
                });
                deferredGet.resolve();
            }).error(function (responseBody) {
                deferredGet.reject(responseBody);
            });

            return topics;
        };

        /**
        * Retrieves a list of topics in a way that is suitable for use
        * as a query function for the select2 widget.
        *
        * @method liveSearchQuery
        * @param options {Object} options object provided by select2 on every
        *   invocation.
        * @param [isCallback=false] {Boolean} if the method is "manually"
        *   invoked (i.e. not by the select2 machinery), this flag should be
        *   set so that the method is aware of this fact
        */
        Topic.liveSearchQuery = function (options, isCallback) {
            var isPaginationCall = (options.page > 1),
                now = dateFactory.makeInstance(),
                url;

            if (!isCallback) {
                // regular select2's onType event, input changed

                if (!isPaginationCall) {
                    lastTermChange = now;

                    $timeout(function () {
                        // NOTE: tests spy on self.authorResource object, thus
                        // we don't call self.liveSearchQuery() but instead
                        // invoke the method through self.authorResource object
                        Topic.liveSearchQuery(options, true);
                    }, SEARCH_DELAY_MS);
                    return;
                } else {
                    if (angular.equals(options.context, lastContext)) {
                        // select2 bug, same pagination page called twice:
                        // https://github.com/ivaynberg/select2/issues/1610
                        return;  // just skip it
                    }
                    lastContext = options.context;
                }
            }

            if (!isPaginationCall && now - lastTermChange < SEARCH_DELAY_MS) {
                return;  // search term changed, skip this obsolete call
            }

            url = Routing.generate(
                'newscoop_gimme_topics_searchtopics',
                {
                    items_per_page: 10,
                    page: options.page,
                    query: options.term
                },
                true
            );

            $http.get(url)
            .success(function (response) {
                var topic,
                    topicList = [];

                response.items.forEach(function (item) {
                    topic = Topic.createFromApiData(item);
                    topicList.push(topic);
                });

                options.callback({
                    results: topicList,
                    more: !pageTracker.isLastPage(response.pagination),
                    context: response.pagination
                });
            });
        };

        /**
        * Creates a new topic on the server and returns a Topic instance
        * representing it.
        *
        * @method create
        * @param title {String} new topics's name
        * @param [parentId] {Number} ID of the parent topic
        * @return {Object} promise object which is resolved with new Topic
        *   instance on success and rejected on error
        */
        Topic.create = function (title, parentId) {
            var deferredPost = $q.defer(),
                requestData;

            requestData = {'topic[title]': title};
            if (typeof parentId !== 'undefined') {
                requestData['topic[parent]'] = parentId;
            }

            $http.post(
                Routing.generate(
                    'newscoop_gimme_topics_createtopic', {}, true
                ),
                requestData
            )
            .then(function (response) {
                var resourceUrl = response.headers('x-location');
                return $http.get(resourceUrl);  // retrieve created topic
            }, $q.reject)
            .then(function (response) {
                var topic = Topic.createFromApiData(response.data);
                deferredPost.resolve(topic);
            }, function () {
                deferredPost.reject();
            });

            return deferredPost.promise;
        };

        /**
        * Assignes all given topics to an article.
        *
        * @method addToArticle
        * @param articleId {Number} article ID
        * @param language {String} article language code (e.g. 'de')
        * @param topics {Array} list of topics to assign
        * @return {Object} promise object that is resolved on successful server
        *   response and rejected on server error response
        */
        Topic.addToArticle = function (articleId, language, topics) {
            var deferred = $q.defer(),
                linkHeader = [];

            if (topics.length < 1) {
                throw new Error('Topics list is empty.');
            }

            topics.forEach(function (item) {
                linkHeader.push(
                    '<' +
                    Routing.generate(
                        'newscoop_gimme_topics_gettopicbyid',
                        {id: item.id},
                        false
                    ) +
                    '; rel="topic">'
                );
            });
            linkHeader = linkHeader.join();

            $http({
                url: Routing.generate(
                    'newscoop_gimme_articles_linkarticle',
                    {number: articleId, language: language},
                    true
                ),
                method: 'LINK',
                headers: {link: linkHeader}
            })
            .success(function () {
                deferred.resolve(topics);
            })
            .error(function (responseBody) {
                deferred.reject(responseBody);
            });

            return deferred.promise;
        };

        /**
        * Unassignes topic from article.
        *
        * @method removeFromArticle
        * @param number {Number} article ID
        * @param language {String} article language code (e.g. 'de')
        * @return {Object} promise object that is resolved on successful server
        *   response and rejected on server error response
        */
        Topic.prototype.removeFromArticle = function(number, language) {
            var topic = this,
                deferred = $q.defer(),
                linkHeader;

            linkHeader = [
                '<',
                Routing.generate(
                    'newscoop_gimme_topics_gettopicbyid',
                    {id: topic.id},
                    false
                ),
                '; rel="topic">'
            ].join('');

            $http({
                url: Routing.generate(
                    'newscoop_gimme_articles_unlinkarticle',
                    {number: number, language:language},
                    true
                ),
                method: 'UNLINK',
                headers: {link: linkHeader}
            })
            .success(function () {
                deferred.resolve();
            })
            .error(function (responseBody) {
                deferred.reject(responseBody);
            });

            return deferred.promise;
        };

        return Topic;
    }
]);
