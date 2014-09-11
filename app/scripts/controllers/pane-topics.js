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

        // TODO: comments, tests
        $scope.findTopics = function (query) {
            var deferred = $q.defer(),
                filtered;

            // TODO: retrieve all available topics (Topic.getAll())
            // - only the first time needed
            // (all is probably still OK? not that big data set and it will
            //  not hammer the server with requests)
            availableTopics = [
                // text property is important, expected by the widget
                {id: 1, text: 'topic 1'},
                {id: 2, text: 'topic 2'},
                {id: 3, text: 'topic 3'},
                {id: 11, text: 'topic 11'},
                {id: 52, text: 'topic 52'},
                {id: 110, text: 'topic 110'}
            ];

            query = query.toLowerCase();

            filtered = _.filter(availableTopics, function (item) {
                return (item.text.indexOf(query) >= 0);
            });

            deferred.resolve(filtered);

            return deferred.promise;
        };

        // retrieve all topics assigned to the article
        $scope.assignedTopics = Topic.getAllByArticle(
            article.articleId, article.language
        );
    }
]);
