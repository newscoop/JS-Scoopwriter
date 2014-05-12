'use strict';

/**
* Service representing an author resource.
*
* @class Author
*/
angular.module('authoringEnvironmentApp').service('articleAuthor', [
    '$http',
    '$resource',
    'configuration',
    function ($http, $resource, configuration) {

        var API_ROOT = configuration.API.full,
            // BASE_URL = configuration.API.rootURI,
            authorResource,
            self = this;

        authorResource = $resource(
            API_ROOT + '/authors/article/:number/:language',
            {},
            {
                query: {
                    method: 'GET',
                    params: {
                        expand: true,
                        items_per_page: 999  // de facto "all authors"
                    },
                    transformResponse: function (data, headersGetter) {
                        var authors = [],
                            authorsData = JSON.parse(data).items;

                        authorsData.forEach(function (item) {
                            var author = self.createFromServerData(item);
                            authors.push(author);
                        });
                        return authors;
                    },
                    isArray: true
                }
            }
        );

        // TODO: comments and tests
        // (check tha correct API call is issued, that response is transformed
        // etc.)
        self.getAll = function (queryParams) {
            return authorResource.query({
                number: queryParams.articleId,
                language: queryParams.articleLang
            });
        };

        // TODO: comments and tests
        // gets data as received by api and create Author object
        self.createFromServerData = function (data) {
            var author = {
                id: data.author.id,
                firstName: data.author.firstName,
                lastName: data.author.lastName,
                articleRole: {
                    id: data.type.id,
                    name: data.type.type
                },
                avatarUrl: '',
                sortOrder: data.order
            };

            // XXX: temporary fix until the API will start returning
            // un-encoded avatar image paths, without host name
            author.avatarUrl =
                'http://' + decodeURIComponent(data.author.image);

            // TODO: decorate with additional methods as needed

            return author;
        };

        // service.query()  <---- all
        // author object ... a single entity
        // author.addNew
        // author.setRole()

        // TODO: and then methods to add, delete, changeRole etc.
        // so that Author returns self-contained author objects
        // with author metadata and methods to manipulate with author
    }
]);

