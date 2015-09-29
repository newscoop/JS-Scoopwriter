'use strict';

/**
* A factory which creates an article articlesList model.
*
* @class ArticlesList
*/
angular.module('authoringEnvironmentApp').factory('ArticlesList', [
    '$http',
    '$q',
    function (
        $http,
        $q) {
        var ArticlesList = function () {};  // articlesList constructor

        /**
        * Converts raw data object to a ArticlesList instance.
        *
        * @method createFromApiData
        * @param data {Object} raw object containing articlesList data
        * @return {Object} created ArticlesList instance
        */
        ArticlesList.createFromApiData = function (data) {
            var articlesList = new ArticlesList();

            articlesList.id = parseInt(data.id);
            articlesList.title = data.title;
            articlesList.notes = (data.notes) ? data.notes : null;
            articlesList.maxItems =
                (data.maxItems) ? parseInt(data.maxItems) : null;
            articlesList.text = articlesList.title;

            return articlesList;
        };

        /**
        * Retrieves a list of all articlesLists assigned to a specific article.
        *
        * Initially, an empty array is returned, which is later filled with
        * data on successful server response. At that point the given promise
        * is resolved (exposed as a $promise property of the returned array).
        *
        * @method getAllByArticle
        * @param number {Number} article ID
        * @param language {String} article language code, e.g. 'de'
        * @return {Object} array of article articlesLists
        */
        ArticlesList.getAllByArticle = function (number, language) {
            var articlesLists = [],
                deferredGet = $q.defer(),
                url;

            articlesLists.$promise = deferredGet.promise;

            url = Routing.generate(
                'newscoop_gimme_articles_getarticle_language_playlists',
                {number: number, language: language},
                true
            );

            $http.get(url)
            .success(function (response) {
                response.items.forEach(function (item) {
                    item = ArticlesList.createFromApiData(item);
                    articlesLists.push(item);
                });
                deferredGet.resolve(articlesLists);
            }).error(function (responseBody) {
                deferredGet.reject(responseBody);
            });

            return articlesLists;
        };

        /**
        * Unassignes articlesList from article.
        *
        * @method removeFromArticle
        * @param number {Number} article ID
        * @param language {String} article language code (e.g. 'de')
        * @return {Object} promise object that is resolved on successful server
        *   response and rejected on server error response
        */
        ArticlesList.prototype.removeFromArticle = function(
            number,
            language,
            articlesList) {
            var deferred = $q.defer(),
                linkHeader;

            linkHeader = [
                '<',
                Routing.generate(
                    'newscoop_gimme_articles_getarticle',
                    {number: number, language: language},
                    false
                ),
                '; rel="article">'
            ].join('');

            $http({
                url: Routing.generate(
                    'newscoop_gimme_articles_lists_unlinkarticle',
                    {id: articlesList.id},
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

        return ArticlesList;
    }
]);
