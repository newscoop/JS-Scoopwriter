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
    function ($scope, article, Topic) {

        // retrieve all topics assigned to the article
        article.promise.then(function (articleData) {
            $scope.assignedTopics = Topic.getAllByArticle(
                articleData.number, articleData.language
            );
        });
    }
]);
