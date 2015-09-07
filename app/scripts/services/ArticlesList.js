'use strict';

/**
* A factory which creates an article articlesList model.
*
* @class ArticlesList
*/
angular.module('authoringEnvironmentApp').factory('ArticlesList', [
    '$http',
    '$q',
    '$timeout',
    'dateFactory',
    'pageTracker',
    'transform',
    function (
        $http,
        $q,
        $timeout,
        dateFactory,
        pageTracker,
        transform) {
        var SEARCH_DELAY_MS = 250,  // after the last search term change
            lastContext = null,  // most recent live search context
            lastTermChange = 0,  // time of the most recent search term change
            ArticlesList = function () {};  // articlesList constructor

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
            articlesList.articlesModificationTime =
                (data.articlesModificationTime) ? 
                new Date(data.articlesModificationTime) : null;

            // display text ... this property is expected by the select2 search
            // widget for all results
            articlesList.text = articlesList.title;

            return articlesList;
        };

        /**
        * Retrieves a list of all existing articlesLists.
        *
        * Initially, an empty array is returned, which is later filled with
        * data on successful server response. At that point the given promise
        * is resolved (exposed as a $promise property of the returned array).
        *
        * @method getAll
        * @param language {String} article language code, e.g. 'de'
        * @return {Object} array of articlesLists
        */
        ArticlesList.getAll = function (language) {
            var articlesLists = [],
                deferredGet = $q.defer(),
                url;

            articlesLists.$promise = deferredGet.promise;

            url = Routing.generate(
                'newscoop_gimme_articles_lists_getlist',
                {language: language, items_per_page: 9999},  // de facto "all"
                true
            );

            $http.get(url)
            .success(function (response) {
                response.items.forEach(function (item) {
                    item = ArticlesList.createFromApiData(item);
                    articlesLists.push(item);
                });
                deferredGet.resolve();
            }).error(function (responseBody) {
                deferredGet.reject(responseBody);
            });

            return articlesLists;
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
            /* TODO: uncomment when api is ready
            url = 'http://newscoop.aes.sourcefabric.net/api/articles/' + 
                number + '/' +
                language + '/playlists.json';
            */

            $http.get(url)
            .success(function (response) {
                response.items.forEach(function (item) {
                    item = ArticlesList.createFromApiData(item);
                    articlesLists.push(item);
                });
                deferredGet.resolve();
            }).error(function (responseBody) {
                deferredGet.reject(responseBody);
            });

            return articlesLists;
        };

        /**
        * Retrieves a list of articlesLists in a way that is suitable for use
        * as a query function for the select2 widget.
        *
        * @method liveSearchQuery
        * @param options {Object} options object provided by select2 on every
        *   invocation.
        * @param [isCallback=false] {Boolean} if the method is "manually"
        *   invoked (i.e. not by the select2 machinery), this flag should be
        *   set so that the method is aware of this fact
        */
        ArticlesList.liveSearchQuery = function (options, isCallback) {
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
                        ArticlesList.liveSearchQuery(options, true);
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
                'newscoop_gimme_articles_lists_getlist',
                {
                    items_per_page: 10,
                    page: options.page,
                    query: options.term
                },
                true
            );

            $http.get(url)
            .success(function (response) {
                var articlesList,
                    articlesListList = [];

                response.items.forEach(function (item) {
                    articlesList = ArticlesList.createFromApiData(item);
                    articlesListList.push(articlesList);
                });

                options.callback({
                    results: articlesListList,
                    more: !pageTracker.isLastPage(response.pagination),
                    context: response.pagination
                });
            });
        };

        /**
        * Assignes all given articlesLists to an article.
        *
        * @method addToArticle
        * @param articleId {Number} article ID
        * @param language {String} article language code (e.g. 'de')
        * @param articlesLists {Array} list of articlesLists to assign
        * @return {Object} promise object that is resolved on successful server
        *   response and rejected on server error response
        */
        ArticlesList.addToArticle = function(
            articleId,
            language,
            articlesLists) {
            var deferred = $q.defer(),
                linkHeader = [],
                articlesListsLinked = 0;

            if (articlesLists.length < 1) {
                throw new Error('ArticlesLists list is empty.');
            }

            linkHeader.push(
                '<' +
                Routing.generate(
                    'newscoop_gimme_articles_getarticle',
                    {number: articleId, language: language},
                    false
                ) +
                '; rel="article">'
            );
            linkHeader = linkHeader.join();

            articlesLists.forEach(function (item) {
                $http({
                    url: Routing.generate(
                        'newscoop_gimme_articles_lists_linkarticle',
                        {id: item.id},
                        true
                    ),
                    method: 'LINK',
                    headers: {link: linkHeader}
                })
                .success(function () {
                    articlesListsLinked++;
                    if (articlesListsLinked === articlesLists.length) {
                        deferred.resolve(articlesLists);
                    }
                })
                .error(function (responseBody) {
                    deferred.reject(responseBody);
                });
            });

            return deferred.promise;
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
