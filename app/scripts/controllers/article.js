'use strict';

/**
* AngularJS controller for loading the article to edit.
*
* @class ArticleCtrl
*/
angular.module('authoringEnvironmentApp').controller('ArticleCtrl', [
    '$scope',
    'article',
    'ArticleType',
    'panes',
    'configuration',
    'mode',
    'platform',
    '$routeParams',
    '$q',
    function (
        $scope, article, ArticleType, panes, configuration, mode, platform,
        $routeParams, $q
    ) {
        var articleService = article;

        articleService.init({
            articleId: $routeParams.article,
            language: $routeParams.language
        });

        $scope.mode = mode;
        $scope.articleService = articleService;
        $scope.panes = panes.query();
        $scope.platform = platform;

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
                var value = $scope.article.fields[field.name];

                if (field.name in cfgFields) {
                    if (value) {
                        $scope.article.fields[field.name] =
                            articleService.deserializeAlohaBlocks(value);
                    } else {
                        $scope.article.fields[field.name] =
                            cfgFields[field.name].defaultText;
                    }
                }
            });

            // convert to array (for sorting purposes in template)
            _(cfgFields).forIn(function (field, key, collection) {
                editableFields.push(field);
            });

            $scope.editableFields = editableFields;
        });
    }
]);
