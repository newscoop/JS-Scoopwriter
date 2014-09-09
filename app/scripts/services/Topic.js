'use strict';

/**
* A factory which creates an article topic model.
*
* @class Topic
*/
angular.module('authoringEnvironmentApp').factory('Topic', [
    '$http',
    '$q',
    function ($http, $q) {
        var self = this,
            Topic = function () {};  // topic constructor

        Topic.createFromApiData = function (data) {
            // TODO: implement, comments, tests
        };

        Topic.getAll = function () {
            // TODO: implement, comments, tests ... like in SnippetTemplate
            // (future object with $promise)
        };

        return Topic;
    }
]);
