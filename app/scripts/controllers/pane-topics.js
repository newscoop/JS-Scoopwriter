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
    'modalFactory',
    'Topic',
    function ($q, $scope, articleService, modalFactory, Topic) {
        var article = articleService.articleInstance,
            availableTopics = [],   // all existing topics to choose from
            topicListRetrieved = false;  // avilableTopics initialized yet?

        $scope.selectedTopics = [];
        $scope.assigningTopics = false;  // topic assignment in progress?

        // retrieve all topics assigned to the article
        $scope.assignedTopics = Topic.getAllByArticle(
            article.articleId, article.language
        );

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

        // retrieve all topics assigned to the article
        $scope.assignedTopics = Topic.getAllByArticle(
            article.articleId, article.language
        );

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

        /**
        * Finds a list of topics that can be assigned to the article based on
        * the search query. Topics that are already selected or assigned to
        * the article are excluded from search results.
        *
        * @method findTopics
        * @param query {String} topics search query
        * @return {Object} promise object which is resolved with (filtered)
        *   search results
        */
        $scope.findTopics = function (query) {
            var deferred = $q.defer(),
                ignored = {},
                filtered;

            // build a list of topic IDs to exclude from results (i.e. topics
            // that are already selected and/or assigned to the article)
            $scope.selectedTopics.forEach(function (item) {
                ignored[item.id] = true;
            });
            $scope.assignedTopics.forEach(function (item) {
                ignored[item.id] = true;
            });

            // topics list is long, thus we only retrieve it once
            if (!topicListRetrieved) {
                availableTopics = Topic.getAll();
            }

            availableTopics.$promise.then(function () {
                topicListRetrieved = true;
                query = query.toLowerCase();

                filtered = _.filter(availableTopics, function (item) {
                    return (
                        !(item.id in ignored) &&
                        item.title.toLowerCase().indexOf(query) >= 0
                    );
                });

                deferred.resolve(filtered);
            });

            return deferred.promise;
        };

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

        /**
        * Asks user to confirm unassigning a topic from the article and then
        * unassignes the topic, if the action is confirmed.
        *
        * @method confirmUnassignTopic
        * @param topic {Object} topic to unassign
        */
        $scope.confirmUnassignTopic = function (topic) {
            var modal,
                title,
                text;

            title = 'Do you really want to unassign this topic from ' +
                'the article?';
            text = 'Should you change your mind, the topic can ' +
                'always be re-assigned again.';

            modal = modalFactory.confirmLight(title, text);

            modal.result.then(function () {
                return article.promise;
            }, $q.reject)
            .then(function (articleData) {
                return topic.removeFromArticle(
                    articleData.number, articleData.language);
            }, $q.reject)
            .then(function () {
                _.remove($scope.assignedTopics, {id: topic.id});
            });
        };
    }
]);
