'use strict';

/**
* A factory which creates article author resource object.
*
* @class Author
*/
angular.module('authoringEnvironmentApp').factory('Author', [
    '$http',
    '$resource',
    'configuration',
    'pageTracker',
    function ($http, $resource, configuration, pageTracker) {

        var API_ENDPOINT = configuration.API.endpoint,
            API_ROOT = configuration.API.full,
            self = this;

        /**
        * Converts author data object to an Author resource object with
        * more structured data and methods for communicating with API.
        *
        * @method authorFromApiData
        * @param data {Object} object containing author data as returned by API
        * @return {Object} author resource object
        */
        self.authorFromApiData = function (data) {
            var author = new self.authorResource();

            author.id = data.author.id;
            author.firstName = data.author.firstName;
            author.lastName = data.author.lastName;
            author.articleRole = {
                id: data.type.id,
                name: data.type.type
            };

            // XXX: temporary fix until the API will start returning
            // un-encoded avatar image paths, without host name
            author.avatarUrl =
                'http://' + decodeURIComponent(data.author.image);

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
                    var author = self.authorFromApiData(item);
                    authors.push(author);
                });
                return authors;
            }
        };

        // XXX: move vars to top
        // XXX: change to 250ms?
        var SEARCH_DELAY_MS = 250;  // after the last change
        var lastPaginationContext = null,
            lastSearchTerm = null,
            lastTermChange = 0;

        var callCount = 0;

        // TODO: comments & tests
        self.liveSearchQuery = function (options, isCallback) {
            var now = new Date(),
                pageNumber = 1,
                paginationCall = false;

            callCount += 1;

            // XXX: wrap this into helper function?
            if (!isCallback) {  // regular select2's onType event, input changed

                // TODO: pagination! if this is 2nd page, don't delay
                // XXX: could use context null?
                //if (options.term !== lastSearchTerm) {
                if (options.context === null) {
                    // console.log('S2: term changed to "' + options.term +
                    //     '" from "' + lastSearchTerm + '", see ya in 1000 ms;',
                    //     'callCount:', callCount);

                    lastSearchTerm = options.term;
                    lastTermChange = now;

                    setTimeout(function () {
                        self.liveSearchQuery(options, true);
                    }, SEARCH_DELAY_MS);
                    return;
                } else {
                    // console.log('S2: seems like pagination for term', options.term,
                    //     'callCount:', callCount);
                    paginationCall = true;

                    // console.log('old pagination context:', lastPaginationContext);

                    // compare by equality? althouh by reference works, too
                    if (paginationCall && options.context == lastPaginationContext) {
                        console.warn('pagination: SAME AS OLD CONTEXT!');
                        return; // skip this duplicate page
                    }

                     // to see if it helps page bug
                    lastPaginationContext = options.context;
                }
            }

            if (!paginationCall && now - lastTermChange < SEARCH_DELAY_MS) {
                // term changed, delay event
                // console.log('too early, term "' + options.term + '" seems',
                //     'obsolete, aborting;', 'callCount:', callCount);
                return;
            } else {
                // console.log('context:', options.context);

                // console.log('no delay, will search for "' + options.term +
                //     '"; pagination:', paginationCall, '; callCount:', callCount);
            }

            // XXX: bug - pagination called twice for the same page:
            // https://github.com/ivaynberg/select2/issues/1610
            // implement a workaround! (i.e. skipping request if
            // requesting the same page) ... maybe compare old context?

            // ........... od tu naprej normalno naprej, kot je že bilo
            if (options.context) {
                pageNumber = options.context.currentPage + 1;
            }

            if (paginationCall) {  // XXX: for debug only, later delete
                console.log('pagination for', options.term, 'page ', pageNumber);
            }

            $http.get(API_ROOT + '/search/authors', {
                params: {
                    query: options.term,
                    page: pageNumber,
                    items_per_page: 10
                }
            }).success(function (response) {
                response.items.forEach(function (item) {
                    item.text = item.firstName + ' ' + item.lastName;
                });

                options.callback({
                    results: response.items,
                    more: !pageTracker.isLastPage(response.pagination),
                    context: response.pagination
                });
            });
        };

        // function addToArtcile(authorId, authorRoleId) {
        //     var linkHeader,
        //         url;

        //     url = [
        //         API_ROOT, 'articles',
        //         options.number, options.language
        //     ].join('/');

        //     linkHeader = '<' + API_ENDPOINT + '/authors/' + authorId +
        //                     '; rel="author">,' +
        //                  '<' + API_ENDPOINT + '/authors/types/' +
        //                     authorRoleId + '; rel="author-type">';

        //     $http({
        //         url: url,
        //         method: 'LINK',
        //         headers: {link: linkHeader}
        //     }).success(function (data) {
        //         console.log('retrieved data:', data);
        //         // TODO: invoke callback with results data
        //         // options.callback({
        //         //     results: results,
        //         //     more: true,
        //         //     context: ctx
        //         // });
        //     });

        //     // TODO: return promise?
        // };

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

        self.authorResource.prototype.updateRole = self.updateRole;
        self.authorResource.liveSearchQuery = self.liveSearchQuery;

        return self.authorResource;
    }
]);

