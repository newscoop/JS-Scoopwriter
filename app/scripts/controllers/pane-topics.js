'use strict';

/**
* AngularJS controller for the Topics pane.
*
* @class PaneTopicsCtrl
*/
angular.module('authoringEnvironmentApp').controller('PaneTopicsCtrl', [
    '$scope',
    'article',
    'Topic',
    function ($scope, articleService, Topic) {
        var article = articleService.articleInstance;

        // retrieve all topics assigned to the article
        $scope.assignedTopics = Topic.getAllByArticle(
            article.articleId, article.language
        );
    }
]);
