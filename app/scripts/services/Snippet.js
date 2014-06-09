'use strict';

/**
* A factory which creates a snippet model.
*
* @class Snippet
*/
angular.module('authoringEnvironmentApp').factory('Snippet', [
    '$http',
    '$q',
    'configuration',
    function ($http, $q, configuration) {
        var API_ROOT = configuration.API.full,
            self = this,
            Snippet = function () {};

        var snippetsResponseMock = [
            {
                id: 1,
                title: 'Sound of the story',
                code: '<iframe width="100%" height="166" scrolling="no" frameborder="no" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/128775977&amp;color=ff6600&amp;auto_play=false&amp;show_artwork=true"></iframe>'
            },
            {
                id: 2,
                title: 'Sound of the story 2',
                code: '<iframe width="100%" height="166" scrolling="no" frameborder="no" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/128775977&amp;color=ff6600&amp;auto_play=false&amp;show_artwork=true"></iframe>'
            },
            {
                id: 3,
                title: 'Sound of the story 3',
                code: '<iframe width="100%" height="166" scrolling="no" frameborder="no" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/128775977&amp;color=ff6600&amp;auto_play=false&amp;show_artwork=true"></iframe>'
            }
        ];

        /**
        * Converts plain snippet data object to a new Snippet instance.
        *
        * @method createFromApiData
        * @param data {Object} plan object containing snippet data
        *   (as returned by API)
        * @return {Object} Snippet resource object
        */
        self.createFromApiData = function (data) {
            var snippet = Object.create(Snippet.prototype);
            // TODO: copy properties as needed
            ['id', 'title', 'code'].forEach(function (attribute) {
                snippet[attribute] = data[attribute];
            });
            return snippet;
        };

        /**
        * Retrieves a list of all snippets attached to a specific article.
        * Returned array has a special $promise property which is resolved or
        * rejected depending on the server response.
        *
        * @method getAllByArticle
        * @param number {Number} article ID
        * @param language {String} article language code, e.g. 'de'
        * @return {Object} "future" array of Snippet objects - initially
        *   an empty array is returned, which is later populated with the
        *   actual data (once the http promise has been successfully resolved)
        */
        Snippet.getAllByArticle = function (number, language) {

            var deferredGet = $q.defer(),
                snippets = [],
                url;

            url = [
                API_ROOT, 'snippets', 'article', number, language
            ].join('/');

            snippets.$promise = deferredGet.promise;

            $http.get(url, {
                params: {
                    items_per_page: 99999  // de facto "all"  TODO: needed?
                }
            }).success(function (response) {
                JSON.parse(response).items.forEach(function (item) {
                    item = self.createFromApiData(item);
                    snippets.push(item);
                });
                // XXX: resolve with data that you put into results array?
                deferredGet.resolve();
            }).error(function (data, status, headers, config) {
                // TODO: just for now when API misbehaves for empty
                // result sets
                // pretend that request succeeded
                snippetsResponseMock.forEach(function (item) {
                    item = self.createFromApiData(item);
                    snippets.push(item);
                });
                deferredGet.reject();  // XXX: give reason?
            });

            return snippets;
        };

        // instance methods  XXX: just an example, later remove foo()
        Snippet.prototype.foo = function () {
            console.log('method foo');
        };

        return Snippet;
    }
]);
