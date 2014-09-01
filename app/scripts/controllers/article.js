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
        var articleService = article,
            self = this;

        articleService.init({
            articleId: $routeParams.article,
            language: $routeParams.language
        });

        $scope.mode = mode;
        $scope.articleService = articleService;
        $scope.panes = panes.query();
        $scope.platform = platform;

        /**
        * Returns text with word and character count information for the given
        * article field.
        *
        * @method fieldStatsText
        * @param fieldName {String} name of the article field (can also be
        *   'title' for the article title).
        * @return {String}
        */
        self.fieldStatsText = function (fieldName) {
            var statsText,
                stats,
                fieldValue;

            if (fieldName === 'title') {
                fieldValue = $scope.article.title;
            } else {
                fieldValue = $scope.article.fields[fieldName];
            }

            stats = articleService.textStats(fieldValue);
            statsText = [
                stats.chars,
                ' Character', (stats.chars !== 1) ? 's' : '',
                ' / ',
                stats.words,
                ' Word', (stats.words !== 1) ? 's' : '',
            ].join('');

            return statsText;
        };

        // listen to editor content changes and update character / word
        // count info above the changed field accordingly
        $scope.$on('texteditor-content-changed', function (
            eventObj, jqEvent, alohaEditable
        ) {
            var fieldName,
                statsText,
                reactOnTypes = {'keypress': true, 'paste': true, 'idle': true};

            if (!(alohaEditable.triggerType in reactOnTypes)) {
                return;
            }

            fieldName = alohaEditable.editable.originalObj.data('field-name');
            statsText = self.fieldStatsText(fieldName);

            $scope.$apply(function () {
                var field = _($scope.editableFields).find({name: fieldName});
                field.statsText = statsText;
            });
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

            // calculate text stats and convert to array (for sorting purposes
            // in template)
            _(cfgFields).forIn(function (field, key, collection) {
                field.statsText = self.fieldStatsText(field.name);
                editableFields.push(field);
            });

            $scope.editableFields = editableFields;
        });

    }
]);
