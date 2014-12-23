'use strict';

/**
* A factory which creates an article section model.
*
* @class Section
*/
angular.module('authoringEnvironmentApp').factory('Section', [
    '$http',
    '$q',
    function ($http, $q) {
        var Section = function () {};  // section constructor

        /**
        * Converts raw data object to a Section instance.
        *
        * @method createFromApiData
        * @param data {Object} raw object containing section data
        * @return {Object} created Section instance
        */
        Section.createFromApiData = function (data) {
            var section = new Section();

            section.number = data.number;
            section.title = data.title;

            return section;
        };

        /**
        * Retrieves a list of all existing sections.
        *
        * Initially, an empty array is returned, which is later filled with
        * data on successful server response. At that point the given promise
        * is resolved (exposed as a $promise property of the returned array).
        *
        * @method getAll
        * @param filters {Object} search filters (issue|publication)
        * @return {Object} array of sections
        */
        Section.getAll = function (filters) {
            var sections = [],
                deferredGet = $q.defer(),
                url;

            sections.$promise = deferredGet.promise;

            url = Routing.generate(
                'newscoop_gimme_sections_getsections',
                filters,
                true
            );

            $http.get(url)
            .success(function (response) {
                response.items.forEach(function (item) {
                    item = Section.createFromApiData(item);
                    sections.push(item);
                });
                deferredGet.resolve();
            }).error(function (responseBody) {
                deferredGet.reject(responseBody);
            });

            return sections;
        };

        return Section;
    }
]);
