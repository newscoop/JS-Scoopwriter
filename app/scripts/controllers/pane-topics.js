'use strict';

/**
* AngularJS controller for the Topics pane.
*
* @class PaneTopicsCtrl
*/
angular.module('authoringEnvironmentApp').controller('PaneTopicsCtrl', [
    '$q',
    '$scope',
    'article',
    'Topic',
    function ($q, $scope, articleService, Topic) {
        var article = articleService.articleInstance,
            availableTopics = [];  // all existing topicsto choose from

        $scope.selectedTopics = [];
        $scope.assigningTopics = false;  // topic assignment in progress?

        // retrieve all topics assigned to the article
        article.promise.then(function (articleData) {
            $scope.assignedTopics = Topic.getAllByArticle(
                articleData.number, articleData.language
            );
        });

        /**
        * Clears the list of currently selected topics.
        *
        * @method clearSelectedTopics
        */
        $scope.clearSelectedTopics = function () {
            while ($scope.selectedTopics.length > 0) {
                $scope.selectedTopics.pop();
            }
        };

        // TODO: comments, tests
        $scope.findTopics = function (query) {
            var deferred = $q.defer(),
                filtered;

            // TODO: retrieve all available topics (Topic.getAll())
            // - only the first time needed
            // (all is probably still OK? not that big data set and it will
            //  not hammer the server with requests)
            availableTopics = [
                {id: 1, title: 'topic 1'},
                {id: 2, title: 'topic 2'},
                {id: 3, title: 'topic 3'},
                {id: 11, title: 'topic 11'},
                {id: 52, title: 'topic 52'},
                {id: 110, title: 'topic 110'}
            ];

            query = query.toLowerCase();

            filtered = _.filter(availableTopics, function (item) {
                // TODO: also filter out topics already assigned to the article
                return (item.title.indexOf(query) >= 0);
            });

            deferred.resolve(filtered);

            return deferred.promise;
        };

        // retrieve all topics assigned to the article
        $scope.assignedTopics = Topic.getAllByArticle(
            article.articleId, article.language
        );

        /**
        * Assigns all currently selected topics to the article and then clears
        * the selected topics list.
        *
        * @method assignSelectedToArticle
        */
        $scope.assignSelectedToArticle = function () {

            $scope.assigningTopics = true;

            Topic.addToArticle(
                article.articleId, article.language, $scope.selectedTopics
            ).then(function (topics) {
                topics.forEach(function (item) {
                    $scope.assignedTopics.push(item);
                });
                $scope.clearSelectedTopics();
            }).finally(function () {
                $scope.assigningTopics = false;
            });

            // XXX: what about errors, e.g. 409 Conflict?
        };
    }
]);
