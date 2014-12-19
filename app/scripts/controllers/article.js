'use strict';

/**
* AngularJS controller for loading the article to edit.
*
* @class ArticleCtrl
*/
angular.module('authoringEnvironmentApp').controller('ArticleCtrl', [
    '$q',
    '$scope',
    '$rootScope',
    'article',
    'Article',
    'ArticleType',
    'panes',
    'configuration',
    'mode',
    'platform',
    function (
        $q, $scope, $rootScope, articleService, Article, ArticleType, panes,
        configuration, mode, platform
    ) {
        var self = this;

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

            stats = Article.textStats(fieldValue);
            statsText = [
                stats.chars,
                ' Character', (stats.chars !== 1) ? 's' : '',
                ' / ',
                stats.words,
                ' Word', (stats.words !== 1) ? 's' : ''
            ].join('');

            return statsText;
        };

        $scope.mode = mode;
        $scope.articleService = articleService;
        $scope.article = articleService.articleInstance;
        $scope.panes = panes.query();
        $scope.platform = platform;

        // listen to editor content changes and update character / word
        // count info above the changed field accordingly
        $rootScope.$on('texteditor-content-changed', function (
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

        // expose a subset of content and non-content fields in scope
        ArticleType.getByName(
            $scope.article.type
        ).then(function (articleType) {
            var cfgFields = configuration.articleTypeFields[articleType.name],
                editableFields = [],
                nonContentFields = [];

            // for empty fields set their corresponding default values 
            articleType.fields.forEach(function (field) {
                var fieldValue = $scope.article.fields[field.name];

                if (
                    field.isHidden ||
                    field.type in {'switch': true, 'body': true}
                ) {
                    return;  // skip hidden fields and switches
                }

                if (!field.showInEditor) {  // a non-content field
                    nonContentFields.push(field);
                } else {
                    // if defined, set default text for empty content fields
                    if ((field.name in cfgFields) && (!fieldValue)) {
                        $scope.article.fields[field.name] =
                            cfgFields[field.name].defaultText;
                        return;
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
            $scope.nonContentFields = nonContentFields;
        });

        /**
        * Saves article's content to server and clears the article modified
        * flag on success.
        *
        * @method save
        */
        $scope.save = function () {
            // XXX: disable save button during saving? to prevent double
            // saving?
            $scope.article.save().then(function () {
                $scope.articleService.modified = false;
            });
        };

        /**
        * Non-content field onChange handler. Sets the article modifed flag.
        *
        * @method nonContentFieldChanged
        */
        $scope.nonContentFieldChanged = function () {
            articleService.modified = true;
        };
    }
]);
