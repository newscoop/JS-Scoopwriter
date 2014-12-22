'use strict';

/**
* A factory which creates an article publication model.
*
* @class Publication
*/
angular.module('authoringEnvironmentApp').factory('Publication', [
    '$http',
    '$q',
    function ($http, $q) {
        var Publication = function () {};  // publication constructor

        /**
        * Converts raw data object to a Publication instance.
        *
        * @method createFromApiData
        * @param data {Object} raw object containing publication data
        * @return {Object} created Publication instance
        */
        Publication.createFromApiData = function (data) {
            var publication = new Publication();
            var statusText = null;

            publication.name = data.name;
            publication.id = data.id;

            return publication;
        };

        /**
        * Retrieves a list of all existing publications.
        *
        * Initially, an empty array is returned, which is later filled with
        * data on successful server response. At that point the given promise
        * is resolved (exposed as a $promise property of the returned array).
        *
        * @method getAll
        * @return {Object} array of publications
        */
        Publication.getAll = function () {
            var publications = [],
                deferredGet = $q.defer(),
                url;

            publications.$promise = deferredGet.promise;

            url = Routing.generate(
                'newscoop_gimme_publications_getpublications',
                {}, 
                true
            );

            $http.get(url)
            .success(function (response) {
                response.items.forEach(function (item) {
                    item = Publication.createFromApiData(item);
                    publications.push(item);
                });
                deferredGet.resolve();
            }).error(function (responseBody) {
                deferredGet.reject(responseBody);
            });

            return publications;
        };

        return Publication;
    }
]);
