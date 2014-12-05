'use strict';

/**
* A factory which creates an article topic model.
*
* @class Topic
*/
angular.module('authoringEnvironmentApp').factory('Topic', [
    '$http',
    '$q',
    function ($http, $q) {
        var Topic = function () {};  // topic constructor

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
