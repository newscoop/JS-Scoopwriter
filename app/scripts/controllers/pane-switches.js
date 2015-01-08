'use strict';

/**
* AngularJS controller for the Switches pane.
*
* @class PaneSwitchesCtrl
*/
angular.module('authoringEnvironmentApp').controller('PaneSwitchesCtrl', [
    '$q',
    'article',
    'ArticleType',
    function ($q, articleService, ArticleType) {
        var self = this;

        self.article = articleService.articleInstance;

        self.modified = false;  // are there any unsaved changes?
        self.saveInProgress = false;  // saving to server in progress?

        // some switches are predefined and always exist in the article object
        self.switches = [
            {name: 'show_on_front_page', text: 'Show on Front Page'},
            {name: 'show_on_section_page', text: 'Show on Section Page'}
        ];

        // load article's switches' values
        ArticleType.getByName(self.article.type)
        .then(function (articleType) {
            articleType.fields.forEach(function (field) {
                if ((!field.isHidden) &&
                    (field.type === 'switch')) {
                    self.switches.push({
                        name: field.name,
                        text: field.phrase || field.name
                    });

                    // convert all switch values to boolean (undefined
                    // field values get converted to false)
                    self.article.fields[field.name] =
                        !!parseInt(self.article.fields[field.name]);
                }
            });

            // convert values of the pre-defined switches to booleans, too
            ['show_on_front_page', 'show_on_section_page'].forEach(
                function (switchName) {
                    self.article.fields[switchName] =
                        !!parseInt(self.article.fields[switchName]);
                }
            );
        });

        /**
        * Checkbox value changed event handler. Sets the dirty flag.
        *
        * @method valueChanged
        */
        self.valueChanged = function () {
            self.modified = true;
        };

        /**
        * Updates article's switches' values on the server.
        *
        * @method save
        */
        self.save = function () {
            var switchNames = _.map(self.switches, 'name');

            self.saveInProgress = true;

            self.article.saveSwitches(switchNames)
            .finally(function () {
                self.modified = false;
                self.saveInProgress = false;
            });
        };
    }
]);
