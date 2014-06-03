'use strict';

/**
* A factory which creates article author resource object.
*
* @class Author
*/
angular.module('authoringEnvironmentApp').factory('Author', [
    '$http',
    '$resource',
    '$q',
    '$timeout',
    'configuration',
    'dateFactory',
    'pageTracker',
    function (
        $http, $resource, $q, $timeout, configuration, dateFactory, pageTracker
    ) {
        var API_ENDPOINT = configuration.API.endpoint,
            API_ROOT = configuration.API.full,
            SEARCH_DELAY_MS = 250,  // after the last search term change
            lastContext = null,  // most recent live search context
            lastTermChange = 0,  // time of the most recent search term change
            self = this;

        /**
        * Converts author data object to an Author resource object with
        * more structured data and methods for communicating with API.
        *
        * @method createFromApiData
        * @param data {Object} object containing author data as returned by API
        * @return {Object} author resource object
        */
        self.createFromApiData = function (data) {
            var author = new self.authorResource();

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
        * @method getAll
        * @param params {Object} object containing search parameters
        *   @param params.number {Number} article ID
        *   @param params.language {String} article language code, e.g. 'de'
        * @return {Object} array of article authors
        */
        self.getAll = {
            method: 'GET',
            isArray: true,
            transformResponse: function (data, headersGetter) {
                var authors = [],
                    authorsData = JSON.parse(data).items;

                authorsData.forEach(function (item) {
                    var author = self.createFromApiData(item);
                    authors.push(author);
                });
                return authors;
            }
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
        self.liveSearchQuery = function (options, isCallback) {
            var now = dateFactory.makeInstance(),
                isPaginationCall = (options.page > 1);

            if (!isCallback) {  // regular select2's onType event, input changed

                if (!isPaginationCall) {
                    lastTermChange = now;

                    $timeout(function () {
                        // NOTE: tests spy on self.authorResource object, thus
                        // we don't call self.liveSearchQuery() but instead
                        // invoke the method through self.authorResource object
                        self.authorResource.liveSearchQuery(options, true);
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

            $http.get(API_ROOT + '/search/authors', {
                params: {
                    query: options.term,
                    page: options.page,
                    items_per_page: 10
                }
            }).success(function (response) {
                var author,
                    authorList = [];

                response.items.forEach(function (item) {
                    author = self.createFromApiData({author: item});
                    authorList.push(author);
                });

                options.callback({
                    results: authorList,
                    more: !pageTracker.isLastPage(response.pagination),
                    context: response.pagination
                });
            });
        };

        // TODO: comments and tests
        self.setOrderOnArticle = function (number, language, authors) {
            var order = [],
                requestConfig,
                url;

            authors.forEach(function (item) {
                order.push(item.id + '-' + item.articleRole.id);
            });
            order = order.join();

            requestConfig = {
                params: {number: number, language: language}
            };

            url = [
                API_ROOT, 'articles', number, language, 'authors','order'
            ].join('/');

            $http.post(
                url,
                {order: order},
                requestConfig
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
        self.addToArticle = function(number, language, roleId) {
            var author = this,
                deferred = $q.defer(),
                linkHeader,
                url;

            url = [API_ROOT, 'articles', number, language].join('/');

            linkHeader = '<' + API_ENDPOINT + '/authors/' + author.id +
                            '; rel="author">,' +
                         '<' + API_ENDPOINT + '/authors/types/' +
                            roleId + '; rel="author-type">';
            $http({
                url: url,
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
        self.removeFromArticle = function(number, language, roleId) {
            var author = this,
                deferred = $q.defer(),
                linkHeader,
                url;

            url = [API_ROOT, 'articles', number, language].join('/');

            linkHeader = '<' + API_ENDPOINT + '/authors/' + author.id +
                            '; rel="author">,' +
                         '<' + API_ENDPOINT + '/authors/types/' +
                            roleId + '; rel="author-type">';
            $http({
                url: url,
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
        * Retrieves a list of all defined author roles from the server.
        *
        * @method getRoleList
        * @return {Object} array of article roles
        */
        self.getRoleList = {
            method: 'GET',
            url: API_ROOT + '/authors/types',
            isArray: true,
            transformResponse: function (data, headersGetter) {
                var rolesData = JSON.parse(data).items;

                rolesData.forEach(function (item) {
                    // "name" is more informative attribute name
                    item.name = item.type;
                    delete item.type;
                });
                return rolesData;
            }
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
        self.updateRole = function (params) {
            var linkHeader,
                promise,
                url;

            url = [API_ROOT,
                  'articles', params.number, params.language,
                  'authors', this.id  // this refers to the author obj. itself
                  ].join('/');

            linkHeader = '<' + API_ENDPOINT + '/authors/types/' +
                             params.oldRoleId + '; rel="old-author-type">,' +
                         '<' + API_ENDPOINT + '/authors/types/' +
                             params.newRoleId + '; rel="new-author-type">';

            promise = $http.post(url, {}, {
                headers: {
                    link: linkHeader
                }
            });
            return promise;
        };

        // th actual object representing the Author resource on the server
        self.authorResource = $resource(
            API_ROOT + '/articles/:number/:language/authors/:authorId', {
                authorId: '@id',
                items_per_page: 99999  // de facto "all"
            }, {
                getAll: self.getAll,
                getRoleList:  self.getRoleList
            }
        );

        // instance methods
        self.authorResource.prototype.addToArticle = self.addToArticle;
        self.authorResource.prototype.removeFromArticle =
            self.removeFromArticle;
        self.authorResource.prototype.updateRole = self.updateRole;

        // "class" methods
        self.authorResource.createFromApiData = self.createFromApiData;
        self.authorResource.liveSearchQuery = self.liveSearchQuery;
        self.authorResource.setOrderOnArticle = self.setOrderOnArticle;

        return self.authorResource;
    }
]);

