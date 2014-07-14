'use strict';

/**
* A factory which creates a snippet template model.
*
* @class SnippetTemplate
*/
angular.module('authoringEnvironmentApp').factory('SnippetTemplate', [
    '$http',
    '$q',
    function ($http, $q) {
        var self = this,
            SnippetTemplate = function () {};  // snippet template constructor

        /**
        * Creates a new SnippetTemplate instance from a plain data object.
        *
        * @method createFromApiData
        * @param data {Object} plain object containing snippet template data
        *   (as returned by API)
        * @return {Object} new SnippetTemplate instance
        */
        self.createFromApiData = function (data) {
            var template = Object.create(SnippetTemplate.prototype);

            ['id', 'name', 'enabled', 'favourite'].forEach(function (attr) {
                template[attr] = data[attr];
            });

            template.fields = [];

            _.forEach(data.fields, function (field, name) {
                if (field.scope !== 'frontend') {
                    return;  // skip internal Newscoop fields
                } else {
                    template.fields.push(angular.copy(field));
                }
            });

            return template;
        };

        /**
        * Retrieves a list of all snippet templates.
        * Returned array has a special $promise property which is resolved or
        * rejected depending on the server response.
        *
        * @method getAll
        * @return {Object} "future" array of SnippetTemplate objects - initially
        *   an empty array is returned, which is later populated with the
        *   actual data (once the http promise has been successfully resolved)
        */
        SnippetTemplate.getAll = function () {
            var deferredGet = $q.defer(),
                templates = [];

            templates.$promise = deferredGet.promise;

            $http.get(Routing.generate('newscoop_gimme_snippettemplates_getsnippettemplates', {}, true), {
                params: {
                    items_per_page: 99999  // de facto "all"
                }
            }).success(function (response) {
                response.items.forEach(function (item) {
                    item = self.createFromApiData(item);
                    templates.push(item);
                });
                deferredGet.resolve();
            }).error(function (responseBody) {
                deferredGet.reject(responseBody);
            });

            return templates;
        };

        // expose as "class" method
        SnippetTemplate.createFromApiData = self.createFromApiData;

        return SnippetTemplate;
    }
]);
