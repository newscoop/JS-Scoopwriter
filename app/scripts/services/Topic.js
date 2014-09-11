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

            topic.id = data.id;
            topic.title = data.title;

            return topic;
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

            // XXX: for now the only way to get article topics from API is
            // through the article object. Later change this to a more
            // efficient call, when API support is added.
            url = Routing.generate(
                'newscoop_gimme_articles_getarticle',
                {number: number, language: language},
                true
            );

            $http.get(url)
            .success(function (response) {
                response.topics.forEach(function (item) {
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
        * Assignes the topic to an article.
        *
        * @method addToArticle
        * @param number {Number} article ID
        * @param language {String} article language code (e.g. 'de')
        * @return {Object} promise object that is resolved on successful server
        *   response and rejected on server error response
        */
        Topic.prototype.addToArticle = function (number, language) {
            var topic = this,
                deferred = $q.defer(),
                linkHeader;

            linkHeader =
                '<' +
                // XXX: gettopic path does not exist (yet) in API!
                '/content-api/topics/' + topic.id +
                // Routing.generate(
                //     'newscoop_gimme_topics_gettopic',
                //     {topicId: topic.id},
                //     false
                // ) +
                '; rel="topic">';

            console.log('linkheader:', linkHeader);

            $http({
                url: Routing.generate(
                    'newscoop_gimme_articles_linkarticle',
                    {number: number, language: language},
                    true
                ),
                method: 'LINK',
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
