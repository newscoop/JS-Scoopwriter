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

        // TODO:comments & tests
        function textStats(text) {
            var stats = {};

            if (text) {
                text = $('<div/>').html(text).text();  // strip HTML
                stats.chars = text.length;
                stats.words = text.split(/\s+/).length;
            } else {
                stats.chars = 0;
                stats.words = 0;
            }
            return stats;
        }

        // TODO:comments, tests
        function textInfo(text) {
            var infoText,
                stats;

            stats = textStats(text);
            infoText = [
                stats.chars,
                ' Character', (stats.chars !== 1) ? 's' : '',
                ' / ',
                stats.words,
                ' Word', (stats.words !== 1) ? 's' : '',
            ].join('');

            return infoText;
        }

        // XXX: this word count logic should be hidden in some service
        $scope.$on('texteditor-content-changed', function (
            eventObj, jqEvent, alohaEditable
        ) {
            var field,
                fieldName,
                infoText,
                newValue,
                reactOnTypes = {'keypress': true, 'paste': true, 'idle': true};

            // TODO: remove this
            if (!(alohaEditable.triggerType in reactOnTypes)) {
                console.debug('not reacting on ', alohaEditable.triggerType,
                    'leaving');
                return;
            }

            fieldName = alohaEditable.editable.originalObj.data('field-name');
            field = _($scope.editableFields).find({name: fieldName});

            newValue = alohaEditable.editable.getContents();
            infoText = textInfo(newValue);

            $scope.$apply(function () {
                field.textStats = infoText;
            });

            // TODO: remove this
            console.debug('texteditor-content-changed, metainfo updated',
                'for field', fieldName, ':', field.textStats);
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
                if (field.name === 'title') {
                    field.textStats = textInfo($scope.article.title);
                } else {
                    field.textStats = textInfo(
                        $scope.article.fields[field.name]
                    );
                }

                editableFields.push(field);
            });

            $scope.editableFields = editableFields;
        });

    }
]);
