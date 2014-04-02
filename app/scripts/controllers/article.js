'use strict';
angular.module('authoringEnvironmentApp').controller('ArticleCtrl', [
    '$scope',
    '$location',
    'article',
    'articleType',
    'panes',
    'configuration',
    'mode',
    'platform',
    'circularBufferFactory',
    '$log',
    function ($scope, $location, article, articleType, panes, configuration, mode, platform, circularBufferFactory, $log) {
        var search = $location.search();
        var n = search.article_number;
        var l = search.language;
        article.init({
            articleId: n,
            language: l
        });
        $scope.mode = mode;
        $scope.status = 'Initialising';
        $scope.history = circularBufferFactory.create({ size: 5 });
        $scope.articleService = article;
        $scope.watchCallback = function (newValue, oldValue) {
            if (angular.equals(newValue, oldValue)) {
                // initialisation
                $scope.modified = false;
                $scope.status = 'Just downloaded';
            } else {
                if (newValue && oldValue) {
                    // modified
                    $scope.history.push(oldValue);
                    $scope.setModified(true);
                } else {
                    // used also for testing
                    oldValue || $log.debug('the old article value is', oldValue);
                    newValue || $log.debug('the new article value is', newValue);
                }
            }
        };
        // wrapper just for testability purposes
        $scope.setModified = function (value) {
            article.modified = value;
        };
        $scope.save = function () {
            article.resource.save({
                articleId: n,
                language: l
            }, $scope.article, function () {
                $scope.setModified(false);
            }, function () {
                $scope.status = 'Error saving';
            });
        };
        $scope.$watch('article', $scope.watchCallback, true);
        $scope.$watch('articleService.modified', function (newValue) {
            if (newValue) {
                $scope.status = 'Modified';
            } else {
                $scope.status = 'Saved';
            }
        });
        article.promise.then(function (article) {
            $scope.article = article;
            if (typeof $scope.type === 'undefined') {
                $scope.type = articleType.get({ type: article.type }, function () {
                    var additional = configuration.additionalFields[article.type];
                    additional.forEach(function (field) {
                        $scope.type.fields.push(field);
                    });
                });
            }
        });
        $scope.panes = panes.query();
        $scope.platform = platform;
        // used to filter
        $scope.editable = function (field) {
            var known = [
                    'date',
                    'dateline',
                    'main_image',
                    'lede',
                    'body',
                    'title'
                ];
            if (known.indexOf(field.name) === -1) {
                return false;
            } else {
                return true;
            }
        };
    }
]);