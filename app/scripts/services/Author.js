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
    function ($http, $resource, configuration) {

        var API_ROOT = configuration.API.full,
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

 //</api/authors/types/1; rel="old-author-type">,</api/authors/types/2; rel="new-author-type">

        // TODO:c comment ... updates (persists) authors role on the srver
        // comment on the hack ... set oldRoleId
        self.updateRole = {
            method: 'POST',
            isArray: true,
            headers: {
                link: '</content-api/authors/types/:oldId;' +
                      '  rel="old-author-type">,' +
                      '</content-api/authors/types/:newId;' +
                      '  rel="new-author-type">'
            },
            transformRequest: function (author, headersGetter) {
                var headers = headersGetter(),
                    newLink;

                newLink = headers.link.replace(':oldId', author.oldRoleId);
                newLink = newLink.replace(':newId', author.articleRole.id);
                headers.link = newLink;
            }
        };

        // th actual object representing the Author resource on the server
        self.authorResource = $resource(
            API_ROOT + '/articles/:number/:language/authors/:authorId', {
                authorId: '@id',
                items_per_page: 99999  // de facto "all"
            }, {
                getAll: self.getAll,
                getRoleList:  self.getRoleList,
                updateRole: self.updateRole
            }
        );

        return self.authorResource;
    }
]);

