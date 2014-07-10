'use strict';

/**
* A factory which creates article author model.
*
* @class Author
*/
angular.module('authoringEnvironmentApp').factory('Author', [
    '$http',
    '$q',
    '$timeout',
    'dateFactory',
    'pageTracker',
    function (
        $http, $q, $timeout, configuration, dateFactory, pageTracker
    ) {
        var SEARCH_DELAY_MS = 250,  // after the last search term change
            lastContext = null,  // most recent live search context
            lastTermChange = 0,  // time of the most recent search term change
            Author = function () {};  // author constructor function;

        /**
        * Converts author data object to an Author resource object with
        * more structured data and methods for communicating with API.
        *
        * @method createFromApiData
        * @param data {Object} object containing author data as returned by API
        * @return {Object} author resource object
        */
        Author.createFromApiData = function (data) {
            var author = new Author();

            author.id = data.author.id;
            author.firstName = data.author.firstName;
            author.lastName = data.author.lastName;
            author.text = data.author.firstName + ' ' + data.author.lastName;

            if (data.type) {
                author.articleRole = {
                    id: data.type.id,
                    name: data.type.type
                };
            } else {
                author.articleRole = null;
            }

            if (data.author.image) {
                // XXX: temporary fix until the API starts returning
                // un-encoded avatar image paths, without host name
                author.avatarUrl =
                    'http://' + decodeURIComponent(data.author.image);
            } else {
                author.avatarUrl = '/images/authors-default-avatar.png';
            }

            author.sortOrder = data.order;

            return author;
        };

        /**
        * Retrieves a list of all article authors for the given article.
        *
        * @method getAllByArticle
        * @param number {Number} article ID
        * @param language {String} article language code, e.g. 'de'
        * @return {Object} array of article authors
        */
        Author.getAllByArticle = function (number, language) {
            var deferredGet = $q.defer(),
                authors = [],
                url = [
                    API_ROOT, 'articles', number, language, 'authors'
                ].join('/');

            authors.$promise = deferredGet.promise;

            $http.get(url, {
                params: {
                    items_per_page: 99999  // de facto "all"
                }
            }).success(function (response) {
                response.items.forEach(function (item) {
                    item = Author.createFromApiData(item);
                    authors.push(item);
                });
                deferredGet.resolve();
            }).error(function (responseBody) {
                deferredGet.reject(responseBody);
            });

            return authors;
        };

        /**
        * Retrieves a list of all defined author roles from the server.
        *
        * @method getRoleList
        * @return {Object} array of article roles
        */
        Author.getRoleList = function () {
            var deferredGet = $q.defer(),
                roles = [],
                url = API_ROOT + '/authors/types';

            roles.$promise = deferredGet.promise;

            $http.get(url, {
                params: {
                    items_per_page: 99999  // de facto "all"
                }
            }).success(function (response) {
                response.items.forEach(function (item) {
                    // "name" is more informative attribute name
                    item.name = item.type;
                    delete item.type;
                    roles.push(item);
                });
                deferredGet.resolve();
            }).error(function (responseBody) {
                deferredGet.reject(responseBody);
            });

            return roles;
        };

        /**
        * Retrieves a list of article authors in a way that is suitable for use
        * as a query function for the select2 widget.
        *
        * @method liveSearchQuery
        * @param options {Object} options object provided by select2 on every
        *   invocation.
        * @param [isCallback=false] {Boolean} if the method is "manually"
        *   invoked (i.e. not by the select2 machinery), this flag should be
        *   set so that the method is aware of this fact
        */
        Author.liveSearchQuery = function (options, isCallback) {
            var now = dateFactory.makeInstance(),
                isPaginationCall = (options.page > 1);

            if (!isCallback) {  // regular select2's onType event, input changed

                if (!isPaginationCall) {
                    lastTermChange = now;

                    $timeout(function () {
                        // NOTE: tests spy on self.authorResource object, thus
                        // we don't call self.liveSearchQuery() but instead
                        // invoke the method through self.authorResource object
                        Author.liveSearchQuery(options, true);
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

            $http.get(Routing.generate('newscoop_gimme_articles_getarticle', {'query':options.term, 'page':options.page, 'items_per_page':10}, true)
            ).success(function (response) {
                var author,
                    authorList = [];

                response.items.forEach(function (item) {
                    author = Author.createFromApiData({author: item});
                    authorList.push(author);
                });

                options.callback({
                    results: authorList,
                    more: !pageTracker.isLastPage(response.pagination),
                    context: response.pagination
                });
            });
        };

        /**
        * Sets a new order of article authors.
        *
        * @method setOrderOnArticle
        * @param number {Number} article ID
        * @param language {String} article language code (e.g. 'de')
        * @param authors {Object} array with author object(s) in desired order
        */
        Author.setOrderOnArticle = function (number, language, authors) {
            var order = [];

            authors.forEach(function (item) {
                order.push(item.id + '-' + item.articleRole.id);
            });
            order = order.join();

            $http.post(
                Routing.generate('newscoop_gimme_authors_setarticleauthorsorder', {'number':number, 'language':language}, true),
                {order: order}
            );
        };

        /**
        * Sets author as article author on the given article
        * with the given role.
        *
        * @method addToArticle
        * @param number {Number} article ID
        * @param language {String} article language code (e.g. 'de')
        * @param roleId {Number} ID of the author's role on the article
        * @return {Object} promise object that is resolved on successful server
        *   response and rejected on server error response
        */
        Author.prototype.addToArticle = function (number, language, roleId) {
            var author = this,
                deferred = $q.defer(),
                linkHeader;

            linkHeader = '<' + Routing.generate('newscoop_gimme_authors_getauthorbyid', {'id':author.id}, true) +
                            '; rel="author">,' +
                         '<' + Routing.generate('newscoop_gimme_authors_getauthortype', {'id':roleId}, true) +
                            '; rel="author-type">';
            $http({
                url: Routing.generate('newscoop_gimme_articles_linkarticle', {'number': number, 'language':language}, true),
                method: 'LINK',
                headers: {link: linkHeader}
            })
            .success(function () {
                author.articleRole = author.articleRole || {};
                author.articleRole.id = roleId;
                deferred.resolve();
            })
            .error(function (responseBody) {
                deferred.reject(responseBody);
            });

            return deferred.promise;
        };


        /**
        * Removes author as article author from the given article for the
        * specified role.
        *
        * @method removeFromArticle
        * @param number {Number} article ID
        * @param language {String} article language code (e.g. 'de')
        * @param roleId {Number} ID of the author's role on the article
        * @return {Object} promise object that is resolved on successful server
        *   response and rejected on server error response
        */
        Author.prototype.removeFromArticle = function (
            number, language, roleId
        ) {
            var author = this,
                deferred = $q.defer(),
                linkHeader;

            linkHeader = '<' + Routing.generate('newscoop_gimme_authors_getauthorbyid', {'id':author.id}, true) +
                            '; rel="author">,' +
                         '<' + Routing.generate('newscoop_gimme_authors_getauthortype', {'id':roleId}, true) +
                            '; rel="author-type">';
            $http({
                url: Routing.generate('newscoop_gimme_articles_unlinkarticle', {'number': number, 'language':language}, true),
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

        /**
        * Updates author's role on a specific article on the server.
        *
        * @method updateRole
        * @param params {Object} object containing API parameters
        *   @param params.number {Number} article ID
        *   @param params.language {String} article language code (e.g. 'de')
        *   @param params.oldRoleId {Number} author's previous role ID
        *   @param params.newRoleId {Number} author's new role ID
        * @return {Object} $http promise
        */
        Author.prototype.updateRole = function (params) {
            var linkHeader,
                promise;

            linkHeader = '<' + Routing.generate('newscoop_gimme_authors_getauthortype', {'id':params.oldRoleId}, true) +
                             '; rel="old-author-type">,' +
                         '<' + Routing.generate('newscoop_gimme_authors_getauthortype', {'id':params.newRoleId}, true) +
                             '; rel="new-author-type">';

            promise = $http.post(Routing.generate('newscoop_gimme_authors_getauthorstypes', {'number':params.number, 'language':params.language, 'authorId':this.id}, true), {}, {
                headers: {
                    link: linkHeader
                }
            });
            return promise;
        };

        return Author;
    }
]);

