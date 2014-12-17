'use strict';

/**
* A factory which creates an article issue model.
*
* @class Issue
*/
angular.module('authoringEnvironmentApp').factory('Issue', [
    '$http',
    '$q',
    function ($http, $q) {
        var Issue = function () {};  // issue constructor

        /**
        * Converts raw data object to a Issue instance.
        *
        * @method createFromApiData
        * @param data {Object} raw object containing issue data
        * @return {Object} created Issue instance
        */
        Issue.createFromApiData = function (data) {
            var issue = new Issue();
            var statusText = null;

            issue.number = data.number;
            issue.title = data.title;

            return issue;
        };

        /**
        * Retrieves a list of all existing issues.
        *
        * Initially, an empty array is returned, which is later filled with
        * data on successful server response. At that point the given promise
        * is resolved (exposed as a $promise property of the returned array).
        *
        * @method getAll
        * @param filters {Object} search filters (publication)
        * @return {Object} array of issues
        */
        Issue.getAll = function (filters) {
            var issues = [],
                deferredGet = $q.defer(),
                url;

            issues.$promise = deferredGet.promise;

            url = Routing.generate(
                'newscoop_gimme_issues_getissues',
                filters, 
                true
            );

            $http.get(url)
            .success(function (response) {
                response.items.forEach(function (item) {
                    item = Issue.createFromApiData(item);
                    issues.push(item);
                });
                deferredGet.resolve();
            }).error(function (responseBody) {
                deferredGet.reject(responseBody);
            });

            return issues;
        };

        return Issue;
    }
]);
