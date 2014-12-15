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

        $scope.select2Options = {
            minimumInputLength: 3,
            query: Topic.liveSearchQuery
        };

        $scope.addingNewTopic = false;  // adding new topic in progress?

        $scope.newTopic = {
            title: '',
            parentTopic: null
        };

        // retrieve all topics assigned to the article
        $scope.assignedTopics = Topic.getAllByArticle(
            article.articleId, article.language
        );

        /**
        * Creates a new topic and then assigns it to the article.
        *
        * @method addNewTopicToArticle
        * @param topicData {Object} object describing the new topic
        *   @param topicData.title {String} topic's title
        *   @param [topicData.parentTopic] {Object} parent topic
        */
        $scope.addNewTopicToArticle = function (topicData) {
            var newTopic;

            $scope.addingNewTopic = true;

            Topic.create(
                topicData.title,
                topicData.parentTopic ? topicData.parentTopic.id : undefined
            )
            .then(function (topic) {
                newTopic = topic;
                return Topic.addToArticle(
                    article.articleId, article.language, [newTopic]
                );
            }, function (response) {
                if (response.status === 409) {
                    // failed due to a duplicate name
                    $scope.addTopic.topicTitle.$setValidity(
                        'duplicate', false);
                }
                return $q.reject(response);
            })
            .then(function () {
                var parentIdx = _.findIndex(
                    $scope.assignedTopics, {id: newTopic.parentId}
                );

                // insert new topic right after its parent or at the end of
                // array if parent is not present
                if (parentIdx > -1) {
                    $scope.assignedTopics.splice(parentIdx + 1, 0, newTopic);
                } else {
                    $scope.assignedTopics.push(newTopic);
                }

                $scope.clearNewTopicForm();
            }, $q.reject)
            .finally(function () {
                $scope.addingNewTopic = false;
            });
        };

        /**
        * Resets all new topic form fields and validation errors.
        *
        * @method clearNewTopicForm
        */
        $scope.clearNewTopicForm = function () {
            $scope.newTopic.title = '';
            $scope.newTopic.parentTopic = null;
            $scope.addTopic.topicTitle.$setValidity('duplicate', true);
        };

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
                return topic.removeFromArticle(
                    article.articleId, article.language);
            }, $q.reject)
            .then(function () {
                _.remove($scope.assignedTopics, {id: topic.id});
            });
        };
    }
]);
