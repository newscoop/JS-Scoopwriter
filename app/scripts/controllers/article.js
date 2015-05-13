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
    'mode',
    'platform',
    function (
        $q, $scope, $rootScope, articleService, Article, ArticleType, panes,
        mode, platform
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

            $scope.$evalAsync(function () {
                var field = _($scope.editableFields).find({name: fieldName});
                field.statsText = statsText;
            });
        });

        // expose a subset of content and non-content fields in scope
        ArticleType.getByName(
            $scope.article.type
        ).then(function (articleType) {
            var editableFields = [],
                nonContentFields = [],
                settings,
                titleField,
                titleFieldIdx;

            // filter out some fields and split others into two groups
            // (content and non-content fields)
            articleType.fields.forEach(function (field) {
                var fieldValue;

                if (field.isHidden) {
                    return;
                }

                if (field.showInEditor &&
                    field.type !== 'switch') {  // field is a content field
                    // set default text if necessary and calculate text stats
                    fieldValue = $scope.article.fields[field.name];
                    if (!fieldValue) {
                        $scope.article.fields[field.name] =
                            AES_SETTINGS.placeholder;
                    }
                    field.statsText = self.fieldStatsText(field.name);
                    editableFields.push(field);
                } else {  // field is a non-content field
                    // skip switches and body fields
                    if ((field.type !== 'switch') && (field.type !== 'body')) {
                        nonContentFields.push(field);
                    }
                }
            });

            // manually create "title" field (because it's not a normal
            // article field but its property instead) and insert it at
            // a correct place in the content fields list (at the beginning
            // by default if not specified in the config)
            settings = AES_SETTINGS.articleTypeFields[articleType.name];

            titleField = {
                name: settings.title.name,
                phrase: settings.title.displayName,
                statsText: self.fieldStatsText('title')
            };
            titleFieldIdx = settings.title.order - 1;

            if (!$scope.article.title) {
                $scope.article.title = AES_SETTINGS.placeholder;
            }

            editableFields = _.sortBy(editableFields, 'fieldWeight');
            editableFields.splice(titleFieldIdx, 0, titleField);
            $scope.editableFields = editableFields;

            $scope.nonContentFields = _.sortBy(
                nonContentFields, 'fieldWeight');
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
