'use strict';
angular.module('authoringEnvironmentApp').controller('ArticleCtrl', [
    '$scope',
    'article',
    'ArticleType',
    'panes',
    'configuration',
    'mode',
    'platform',
    '$log',
    '$routeParams',
    '$q',
    function (
        $scope, article, ArticleType, panes, configuration, mode, platform,
        $log, $routeParams, $q
    ) {
        var articleService = article;

        article.init({
            articleId: $routeParams.article,
            language: $routeParams.language
        });

        $scope.mode = mode;
        $scope.articleService = articleService;

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

        articleService.promise  // a promise to retrieve the article
        .then(
            function (article) {
                $scope.article = article;
                return ArticleType.getByName(article.type);
            },
            $q.reject
        ).then(function (articleType) {
            var cfgFields = configuration.articleTypeFields[articleType.name],
                editableFields = [];

            // Go through all the fields defined for this particular article's
            // type. Those that are listed in config get deserialized, so that
            // any dropped images and snippets in their content get converted
            // to Aloha blocks.
            // NOTE: no need to deserialize other fields, since only the fields
            // listed in the configuration are available to user for editing.
            articleType.fields.forEach(function (field) {
                if (field.name in cfgFields) {
                    $scope.article.fields[field.name] =
                        articleService.deserializeAlohaBlocks(
                            $scope.article.fields[field.name]
                        );
                }
            });

            // convert to array (for sorting purposes in template)
            _(cfgFields).forIn(function (field, key, collection) {
                editableFields.push(field);
            });

            $scope.editableFields = editableFields;
        });

        $scope.panes = panes.query();
        $scope.platform = platform;
    }
]);
