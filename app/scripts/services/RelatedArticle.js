'use strict';

/**
* A factory which creates an article relatedArticle model.
*
* @class RelatedArticle
*/
angular.module('authoringEnvironmentApp').factory('RelatedArticle', [
    '$http',
    '$q',
    function ($http, $q) {
        var RelatedArticle = function () {};  // relatedArticle constructor

        /**
        * Converts raw data object to a RelatedArticle instance.
        *
        * @method createFromApiData
        * @param data {Object} raw object containing relatedArticle data
        * @return {Object} created RelatedArticle instance
        */
        RelatedArticle.createFromApiData = function (data) {
            var relatedArticle = new RelatedArticle();
            var statusText = null;

            relatedArticle.number = data.number;
            relatedArticle.title = data.title;
            relatedArticle.lead = data.fields.lede;
            relatedArticle.body = data.fields.body;
            relatedArticle.image = decodeURIComponent(data.renditions[0].link);
            relatedArticle.section = data.section.title;

            /**
             * TODO: Find a better way to do this
             */
            relatedArticle.published = data.published;
            if (data.status === "N") {
                statusText = "New";
            } else if (data.status === "S") {
                statusText = "Submitted";
            } else if (data.status === "Y") {
                statusText = "Published";
            } else if (data.status === "M") {
                statusText = "Published with Issue";
            } else {
                statusText = data.status;
            }

            relatedArticle.status = statusText;

            return relatedArticle;
        };

        /**
        * Retrieves a list of all existing relatedArticles.
        *
        * Initially, an empty array is returned, which is later filled with
        * data on successful server response. At that point the given promise
        * is resolved (exposed as a $promise property of the returned array).
        *
        * @method getAll
        * @return {Object} array of relatedArticles
        */
        RelatedArticle.getAll = function () {
            var relatedArticles = [],
                deferredGet = $q.defer(),
                url;

            relatedArticles.$promise = deferredGet.promise;

            url = Routing.generate(
                'newscoop_gimme_articles_getarticles',
                {},  // de facto "all"
                true
            );

            $http.get(url)
            .success(function (response) {
                response.items.forEach(function (item) {
                    item = RelatedArticle.createFromApiData(item);
                    relatedArticles.push(item);
                });
                deferredGet.resolve();
            }).error(function (responseBody) {
                deferredGet.reject(responseBody);
            });

            return relatedArticles;
        };

        /**
        * Retrieves a list of all relatedArticles assigned to a specific article.
        *
        * Initially, an empty array is returned, which is later filled with
        * data on successful server response. At that point the given promise
        * is resolved (exposed as a $promise property of the returned array).
        *
        * @method getAllByArticle
        * @param number {Number} article ID
        * @param language {String} article language code, e.g. 'de'
        * @return {Object} array of article relatedArticles
        */
        RelatedArticle.getAllByArticle = function (number, language) {
            var relatedArticles = [],
                deferredGet = $q.defer(),
                url;

            relatedArticles.$promise = deferredGet.promise;

            url = Routing.generate(
                'newscoop_gimme_articles_related',
                {number: number, language: language},
                true
            );

            $http.get(url)
            .success(function (response) {
                response.items.forEach(function (item) {
                    item = RelatedArticle.createFromApiData(item);
                    relatedArticles.push(item);
                });
                deferredGet.resolve();
            }).error(function (responseBody) {
                deferredGet.reject(responseBody);
            });


            return relatedArticles;
        };

        /**
        * Assignes all given relatedArticles to an article.
        *
        * @method addToArticle
        * @param articleId {Number} article ID
        * @param language {String} article language code (e.g. 'de')
        * @param relatedArticles {Array} list of relatedArticles to assign
        * @return {Object} promise object that is resolved on successful server
        *   response and rejected on server error response
        */
        RelatedArticle.addToArticle = function (articleId, language, relatedArticle) {
            var deferred = $q.defer(),
                linkHeader = [];

            linkHeader = [
                '<' +
                Routing.generate(
                    'newscoop_gimme_articles_getarticle',
                    {number: relatedArticle.number},
                    false
                ) +
                '; rel="topic">'
            ].join('');

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
                deferred.resolve();
            })
            .error(function (responseBody) {
                deferred.reject(responseBody);
            });

            return deferred.promise;
        };

        /**
        * Unassignes relatedArticle from article.
        *
        * @method removeFromArticle
        * @param number {Number} article ID
        * @param language {String} article language code (e.g. 'de')
        * @return {Object} promise object that is resolved on successful server
        *   response and rejected on server error response
        */
        RelatedArticle.prototype.removeFromArticle = function(number, language) {
            var relatedArticle = this,
                deferred = $q.defer(),
                linkHeader;

            linkHeader = [
                '<',
                Routing.generate(
                    'newscoop_gimme_articles_getarticle',
                    {number: relatedArticle.number},
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

        return RelatedArticle;
    }
]);
