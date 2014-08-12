'use strict';
angular.module('authoringEnvironmentApp').controller('ArticleCtrl', [
    '$scope',
    'article',
    'articleType',
    'panes',
    'configuration',
    'mode',
    'platform',
    '$log',
    '$routeParams',
    function (
        $scope, article, articleType, panes, configuration, mode, platform,
        $log, $routeParams
    ) {

        article.init({
            articleId: $routeParams.article,
            language: $routeParams.language
        });

        $scope.mode = mode;
        $scope.articleService = article;

        $scope.watchCallback = function (newValue, oldValue) {
            if (angular.equals(newValue, oldValue)) {
                // initialisation
                $scope.modified = false;
            } else {
                if (newValue && oldValue) {
                    // modified
                    $scope.setModified(true);
                } else {
                    // used also for testing
                    if (!oldValue) {
                        $log.debug('the old article value is', oldValue);
                    }
                    if (!newValue) {
                        $log.debug('the new article value is', newValue);
                    }
                }
            }
        };
        // wrapper just for testability purposes
        $scope.setModified = function (value) {
            article.modified = value;
        };

        $scope.$watch('article', $scope.watchCallback, true);
        $scope.$watch('articleService.modified', function (newValue) {
            if (newValue) {
                $scope.status = 'Modified';
            } else {
                $scope.status = 'Saved';
            }
        });

        $scope.articleService.promise.then(function (article) {
            $scope.article = article;

            for (var key in article.fields) {
                if (article.fields.hasOwnProperty(key)) {
                    article.fields[key] =
                        $scope.articleService.deserializeAlohaBlocks(
                            article.fields[key]
                        );
                }
            }
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
                'date', 'dateline', 'main_image', 'lede', 'body', 'title'
            ];
            if (known.indexOf(field.name) === -1) {
                return false;
            } else {
                return true;
            }
        };
    }
]);
