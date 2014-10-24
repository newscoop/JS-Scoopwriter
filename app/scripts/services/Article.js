'use strict';

/**
* A factory which creates article model.
*
* @class Article
*/
angular.module('authoringEnvironmentApp').factory('Article', [
    '$http',
    '$q',
    function ($http, $q) {
        var Article;

        /**
        * Article constructor function.
        *
        * @function Article
        * @param data {Object} object containing article data
        */
        Article = function (data) {
            // TODO: implement
        };

        // all possible values for the article commenting setting
        Article.commenting = Object.freeze({
            ENABLED: 0,
            DISABLED: 1,
            LOCKED: 2
        });

        // all possible values for the article workflow status
        Article.wfStatus = Object.freeze({
            NEW: 'N',
            SUBMITTED: 'S',
            PUBLISHED: 'Y',
            PUBLISHED_W_ISS: 'M'
        });

        // all possible values for the article issue workflow status
        Article.issueWfStatus = Object.freeze({
            NOT_PUBLISHED: 'N',
            PUBLISHED: 'Y'
        });

        return Article;
    }
]);
