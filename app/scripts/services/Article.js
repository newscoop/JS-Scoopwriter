'use strict';

/**
* A factory which creates article model.
*
* @class Article
*/
angular.module('authoringEnvironmentApp').factory('Article', [
    '$http',
    '$q',
    'transform',
    'ArticleType',
    'toaster',
    'TranslationService',
    function (
        $http,
        $q,
        transform,
        ArticleType,
        toaster,
        TranslationService) {
        var Article,
            unicodeWords = new XRegExp('(\\p{Letter}|\\d)+', 'g');

        /**
        * Finds snippets placeholders in text and converts them to
        * snippets HTML (this can be later converted to Aloha blocks).
        *
        * An example of such placeholder:
        *     <-- Snippet 1234 -->
        *
        * @function snippetCommentsToDivs
        * @param text {String} text to convert
        * @return {String} converted text
        */
        function snippetCommentsToDivs(text) {
            // the extra backslash (\) is because of Javascript being picky
            var snippetRex  = '<--';     // exact match
            snippetRex     += '\\s';      // single whitespace
            snippetRex     += 'Snippet';  // exact match
            snippetRex     += '\\s';      // single whitespace
            snippetRex     += '([\\d]+)'; // capture group 1, 1 or more digits
            snippetRex     += '(';               // capture group 2
            snippetRex     +=     '(';           // capture group 3
            snippetRex     +=         '[\\s]+';  // at least 1 whitespace
            snippetRex     +=         '(align';  // alternating capture group
            snippetRex     +=         '|\\w+)';  // or any other word
            snippetRex     +=         '\\s*';    // optional whitespace
            snippetRex     +=         '=';       // exact match
            snippetRex     +=         '\\s*';    // optional whitespace
            snippetRex     +=         '(';          // capture group 4
            snippetRex     +=             '"[^"]*"';  // anything except "
            snippetRex     +=             '|[^\\s]*'; // anything but whitesp.
            snippetRex     +=         ')';         // end capture group 4
            snippetRex     +=     ')*';    // end capture group 3 (0 or more)
            snippetRex     += ')';       // end capture group 2
            snippetRex     += '[\\s]*';  // optional whitespace
            snippetRex     += '-->';      // exact match
            var snippetPattern = new RegExp(snippetRex, 'ig');

            var converted = text.replace(snippetPattern, function(whole, id) {
                var output = '<div ' +
                    'class="snippet aloha-snippet-block" data-id="';
                output += parseInt(id);
                output += '"></div>';
                return output;
            });
            return converted;
        }

        /**
        * Finds images placeholders in text and converts them to
        * images HTML (these can be then converted to Aloha blocks).
        *
        * An example of such placeholder:
        *     <!** Image 1234 float="left" size="small" >
        *
        * @function imageCommentsToDivs
        * @param text {String} text to convert
        * @return {String} converted text
        */
        function imageCommentsToDivs(text) {
            // the extra backslash (\) is because of Javascript being picky
            var imageReg  = '<!';         // exact match
            imageReg     += '\\*\\*';    // exact match on **
            imageReg     += '[\\s]*';    // optional whitespace
            imageReg     += 'Image';     // exact match
            imageReg     += '[\\s]+';    // whitespace
            imageReg     += '([\\d]+)';  // capture group 1, number
            imageReg     += '(';         // capture group 2
            imageReg     +=     '(';       // capture group 3, 0 to unlimited
            imageReg     +=         '[\\s]+';  // optional whitespace
            imageReg     +=         '(align|alt|sub';  // alternating capt. gr.
            imageReg     +=         '|width|height|ratio';
            imageReg     +=         '|\\w+)';  // or any word, end of group
            imageReg     +=         '\\s*';    // optional whitespace
            imageReg     +=         '=';       // exact match
            imageReg     +=         '\\s*';    // optional whitespace
            imageReg     +=         '(';       // capture group 4
            imageReg     +=             '"[^"]*"';  // anything except "
            imageReg     +=             '|[^\\s]*'; // anything but whitespace
            imageReg     +=         ')';       // end capture group 4
            imageReg     +=     ')*';        //end capture group 3 (0 or more)
            imageReg     += ')';           // end capture group 2
            imageReg     += '[\\s]*';      // optional whitespace
            imageReg     += '>';           // exact match
            var imagePattern = new RegExp(imageReg, 'ig');

            // NOTE: capture group 1 catches articleImageId which is NOT the
            // same as imageId - it represents an ID of a (imageId, articleId)
            // pair from database, meaning "image X is attached to article Y"

            var converted = text.replace(
                imagePattern,
                function (whole, articleImageId, imageAttributes) {
                    var imageDiv = '<div ' +
                        'class="image aloha-image-block" dropped-image ' +
                        'data-articleimageid="' + articleImageId + '"';
                    var tmpElement = document.createElement('div');
                    tmpElement.innerHTML = '<div '+imageAttributes+'></div>';
                    var attributes = tmpElement.childNodes[0].attributes;

                    for (var i = 0; i < attributes.length; i++) {
                        imageDiv += ' data-' + attributes[i].name +
                            '="'+attributes[i].value + '"';
                    }

                    imageDiv += '></div>';
                    return imageDiv;
                }
            );
            return converted;
        }

        /**
        * Converts images' and snippets' HTML in article text (Aloha blocks) to
        * special placeholders, allowing to later convert those placeholders
        * back to original content.
        *
        * @function serializeAlohaBlocks
        * @param text {String} text to convert
        * @return {String} converted text
        */
        function serializeAlohaBlocks(text) {
            var content,
                matches,
                sep;

            if (text === null) {
                return text;
            }

            sep = {snippet: '--', image: '**'};
            content = $('<div/>').html(text);

            ['image', 'snippet'].forEach(function (type) {
                matches = content.contents().filter('div.' + type);

                // replace each matching div with its serialized version
                matches.replaceWith(function () {
                    var dataItemName,
                        serialized,
                        $match = $(this);

                    serialized = [
                        '<', sep[type], ' ',
                        type.charAt(0).toUpperCase(), type.slice(1), ' '
                    ];

                    dataItemName = (type === 'snippet') ?
                                    'id' : 'articleimageid';
                    serialized.push(parseInt($match.data(dataItemName)));

                    $.each($match.data(), function (name, value) {
                        if ((name !== 'id') && (name !== 'articleimageid')) {
                            serialized.push(' ', name, '="', value, '"');
                        }
                    });

                    serialized.push(' ', sep[type], '>');
                    return serialized.join('');
                });
            });

            return content.html()
                .replace(/\&lt\;\*\*/g, '<!**')  // replace &lt;** with <!**
                .replace(/\*\*\&gt\;/g, '>')  // replace **&gt; with >
                .replace(/\&lt\;\-\-/g,'<--')   // replace &lt;-- with <--
                .replace(/\-\-\&gt\;/g, '-->');  // replace --&gt; with -->
        }

        /**
        * Converts placeholders in text to images and snippets HTML.
        *
        * @function deserializeAlohaBlocks
        * @param text {String} text to convert
        * @return {String} converted text
        */
        function deserializeAlohaBlocks(text) {
            return imageCommentsToDivs(snippetCommentsToDivs(text));
        }

        /**
        * Article constructor function.
        *
        * @function Article
        * @param data {Object} object containing article data
        */
        Article = function (data) {
            var self = this;

            data = data || {};
            data.fields = data.fields || {};

            angular.extend(self, data);

            // rename "number" to "articleId"
            self.articleId = self.number;
            delete self.number;

            Object.keys(self.fields).forEach(function (key) {
                // XXX: it would be beneficial if API returned fields' metadata
                // so that we can deserialize blocks in content fields only
                // As a temporary fix, skip deserializing non-string fields
                var fieldValue = self.fields[key];
                if (typeof fieldValue === 'string') {
                    self.fields[key] = deserializeAlohaBlocks(fieldValue);
                }
            });

            self.comments_locked = !!parseInt(self.comments_locked);
            self.comments_enabled = !!parseInt(self.comments_enabled);
            self.statusString = _.property(data.status)
                (_.invert(Article.wfStatus));
        };

        // all possible values for the article commenting setting
        Article.commenting = Object.freeze({
            ENABLED: 0,
            DISABLED: 1,
            LOCKED: 2
        });

        // all possible values for the article workflow status
        Article.wfStatus = Object.freeze({
            NEW: 'N',
            SUBMITTED: 'S',
            PUBLISHED: 'Y',
            PUBLISHED_W_ISS: 'M'
        });

        // all possible values for the article issue workflow status
        Article.issueWfStatus = Object.freeze({
            NOT_PUBLISHED: 'N',
            PUBLISHED: 'Y'
        });

        /**
        * Retrieves a specific article from the server.
        *
        * @method getById
        * @param articleId {Number} article ID
        * @param langCode {String} article language code (e.g. 'en')
        * @return {Object} promise object which is resolved with retrieved
        *   Article instance on success and rejected with server error
        *   message on failure
        */
        Article.getById = function (articleId, langCode) {
            var deferredGet = $q.defer(),
                url;

            url = Routing.generate(
                'newscoop_gimme_articles_getarticle',
                {number: articleId, language: langCode},
                true
            );

            $http.get(url)
            .success(function (data) {
                var article = new Article(data);
                deferredGet.resolve(article);
            }).error(function (responseBody) {
                deferredGet.reject(responseBody);
            });

            return deferredGet.promise;
        };

        /**
        * Returns the number of characters and the number of
        * words in a string.
        *
        * @method textStats
        * @param text {String} text for which to calculate the stats
        * @return {Object} text statistics (e.g. {chars: 15, words:4})
        */
        Article.textStats = function (text) {
            var match,
                stats = {};

            if (text) {
                text = $('<div/>').html(text).text();  // strip HTML
                stats.chars = text.length;

                match = text.match(unicodeWords);
                stats.words = match ? match.length : 0;
            } else {
                stats.chars = 0;
                stats.words = 0;
            }
            return stats;
        };

        // XXX: save(), saveSwitches() and changeCommentingSetting() methods
        // only differ in postData - refactor common API invocation logic
        // into its own helper method

        /**
        * Returns an array of field names that would most 
        * likely be used for display
        *
        * because this requires separate api request, and is currently
        * only used for previewRelatedArticle() it is not included in
        * constructor
        *
        * @method loadContentFields
        * @return {Object} promise object which is resolved with retrieved
        *   contentFields
        */
        Article.prototype.loadContentFields = function() {
            var self = this,
                contentFields = [],
                deferredGet = $q.defer();

            contentFields.$promise = deferredGet.promise;

            // lookup ArticleType and set content fields for preview
            ArticleType.getByName(self.type).then(function(articleType) {
                /**
                 * check for fields that are marked with isContent or 
                 * or showInEditor and are of type body or longtext
                 * (using unshift here because lead and teaser are returned
                 *  after body, and we want these to display in reverse order
                 *  by default)
                 */
                articleType.fields.forEach(function (field) {
                    if (field.isContentField) {
                        contentFields.unshift(field.name);
                        return;
                    }
                    if ((field.showInEditor) &&
                        ((field.type === 'body') ||
                         (field.type === 'longtext'))) {
                        contentFields.unshift(field.name);
                        return;
                    }
                });
                deferredGet.resolve(contentFields);
            });

            return deferredGet.promise;
        };

        /**
        * Returns filename of the first image attached to an article
        *
        * because this requires separate api request, and is currently
        * only used for previewRelatedArticle() it is not included in
        * constructor
        *
        * @method loadFirstImage
        * @return {Object} promise object which is resolved with retrieved
        *   basename of an articles first image
        */
        Article.prototype.loadFirstImage = function() {
            var self = this,
                deferredGet = $q.defer(),
                url = Routing.generate(
                    'newscoop_gimme_images_getimagesforarticle',
                    {number: self.articleId, language: self.language}, true
                );

            $http.get(url)
            .success(function (response) {
                if (response.items.length > 0) {
                    deferredGet.resolve(response.items[0].basename);
                } else {
                    deferredGet.reject('Empty List');
                }
            }).error(function (responseBody) {
                deferredGet.reject(responseBody);
            });

            return deferredGet.promise;
        };

        /**
        * Retrieves a list of all existing relatedArticles.
        *
        * Initially, an empty array is returned, which is later filled with
        * data on successful server response. At that point the given promise
        * is resolved (exposed as a $promise property of the returned array).
        *
        * @method searchArticles
        * @param query {String} search query
        * @param filters {Object} search filters (issue|publication|section)
        * @return {Object} promise object which is resolved with retrieved
        *   Articles search results
        */
        Article.prototype.searchArticles = function (query, filters) {
            var allArticles = [],
                deferredGet = $q.defer(),
                params = {},
                url;

            allArticles.$promise = deferredGet.promise;
           
            if (!_.isEmpty(filters)) {
                params = filters;
            }

            params.items_per_page = 20;
            params.query = query;
 
            url = Routing.generate(
                'newscoop_gimme_articles_searcharticles',
                params,
                true
            );

            $http.get(url)
            .success(function (response) {
                response.items.forEach(function (item) {
                    var article = new Article(item);
                    allArticles.push(article);
                });
                deferredGet.resolve(allArticles);
            }).error(function (responseBody) {
                deferredGet.reject(responseBody);
            });

            return deferredGet.promise;
        };

        /**
        * Retrieves a list of all relatedArticles
        * assigned to a specific article.
        *
        * Initially, an empty array is returned, which is later filled with
        * data on successful server response. At that point the given promise
        * is resolved (exposed as a $promise property of the returned array).
        *
        * @method getRelatedArticles
        * @return {Object} array of article relatedArticles
        */
        Article.prototype.getRelatedArticles = function () {
            var relatedArticles = [],
                self = this,
                deferredGet = $q.defer(),
                url;

            relatedArticles.$promise = deferredGet.promise;

            url = Routing.generate(
                'newscoop_gimme_articles_related',
                {number: self.articleId, language: self.language},
                true
            );

            $http.get(url)
            .success(function (response) {
                response.items.forEach(function (item) {
                    var article = new Article(item);
                    relatedArticles.push(article);
                });
                deferredGet.resolve();
            }).error(function (responseBody) {
                deferredGet.reject(responseBody);
            });

            return relatedArticles;
        };

        /**
        * Assignes all given relatedArticles to an article.
        *
        * @method addToArticle
        * @param relatedArticles {Array} list of relatedArticles to assign
        * @return {Object} promise object that is resolved on successful server
        *   response and rejected on server error response
        */
        Article.prototype.addRelatedArticle = function (relatedArticle) {
            var deferred = $q.defer(),
                self = this,
                linkHeader = [];

            linkHeader = [
                '<' +
                Routing.generate(
                    'newscoop_gimme_articles_getarticle',
                    {number: relatedArticle.articleId},
                    false
                ) +
                '; rel="topic">'
            ].join('');

            $http({
                url: Routing.generate(
                    'newscoop_gimme_articles_linkarticle',
                    {number: self.articleId, language: self.language},
                    true
                ),
                method: 'LINK',
                headers: {link: linkHeader}
            })
            .success(function () {
                deferred.resolve();
                toaster.add({
                    type: 'sf-info',
                    message: TranslationService.trans(
                        'aes.msgs.relatedarticles.pin.success'
                    )
                });
            })
            .error(function (responseBody) {
                deferred.reject(responseBody);
                toaster.add({
                    type: 'sf-error',
                    message: TranslationService.trans(
                        'aes.msgs.relatedarticles.pin.error'
                    )
                });
            });

            return deferred.promise;
        };

        /**
        * Unassignes relatedArticle from article.
        *
        * @method removeFromArticle
        * @return {Object} promise object that is resolved on successful server
        *   response and rejected on server error response
        */
        Article.prototype.removeRelatedArticle = function(relatedArticle) {
            var deferred = $q.defer(),
                self = this,
                linkHeader;

            linkHeader = [
                '<',
                Routing.generate(
                    'newscoop_gimme_articles_getarticle',
                    {number: relatedArticle.articleId},
                    false
                ),
                '; rel="topic">'
            ].join('');

            $http({
                url: Routing.generate(
                    'newscoop_gimme_articles_unlinkarticle',
                    {number: self.articleId, language: self.language},
                    true
                ),
                method: 'UNLINK',
                headers: {link: linkHeader}
            })
            .success(function () {
                deferred.resolve();
                toaster.add({
                    type: 'sf-info',
                    message: TranslationService.trans(
                        'aes.msgs.relatedarticles.unpin.success'
                    )
                });
            })
            .error(function (responseBody) {
                deferred.reject(responseBody);
                toaster.add({
                    type: 'sf-error',
                    message: TranslationService.trans(
                        'aes.msgs.relatedarticles.unpin.error'
                    )
                });
            });

            return deferred.promise;
        };

        /**
        * Saves all changes in article content to the server.
        *
        * @method save
        * @return {Object} promise object.
        */
        Article.prototype.save = function () {
            var deferred = $q.defer(),
                postData = {
                    article: {fields: {}}
                },
                self = this,
                url;

            url = Routing.generate(
                'newscoop_gimme_articles_patcharticle',
                {number: self.articleId, language: self.language},
                true
            );

            angular.extend(postData.article.fields, self.fields);

            // remove pre-defined switches from POST data as they are not
            // really article fields and cause trouble
            // (don't ask why, some weird Newscoop stuff :))
            delete postData.article.fields.show_on_front_page;
            delete postData.article.fields.show_on_section_page;

            // name is not a regular article field, need to set it manually
            postData.article.name = self.title;

            // serialize objects (images, snippets) in all article fields
            Object.keys(postData.article.fields).forEach(function (key) {
                postData.article.fields[key] = serializeAlohaBlocks(
                    postData.article.fields[key]
                );
            });

            $http.patch(
                url, postData, {transformRequest: transform.formEncode}
            ).success(function () {
                deferred.resolve();
            }).error(function (responseBody) {
                deferred.reject(responseBody);
            });

            return deferred.promise;
        };

        /**
        * Saves current values of article's switches to the server.
        *
        * @method saveSwitches
        * @param switchNames {Array} list of article field names of type switch
        * @return {Object} promise object
        */
        // XXX: get rid of explicitly passing switchNames?
        Article.prototype.saveSwitches = function (switchNames) {
            var deferred = $q.defer(),
                postData = {
                    article: {fields: {}}
                },
                self = this,
                url;

            url = Routing.generate(
                'newscoop_gimme_articles_patcharticle',
                {number: self.articleId, language: self.language},
                true
            );

            // parse bools to int (api expects ints)
            // remove pre-defined switches
            // (don't ask why, some weird Newscoop stuff :))
            switchNames.forEach(function (name) {
                if ((name !== 'show_on_front_page') &&
                    (name !== 'show_on_section_page')) {
                    postData.article.fields[name] = self.fields[name] ? 1 : 0;
                }
            });
            postData.article.onFrontPage = self.fields.show_on_front_page ?
            1 : 0;
            postData.article.onSection = self.fields.show_on_section_page ?
            1 : 0;
            postData.article.name = self.title;

            $http.patch(
                url, postData, {transformRequest: transform.formEncode}
            ).success(function () {
                deferred.resolve();
            }).error(function (responseBody) {
                deferred.reject(responseBody);
            });

            return deferred.promise;
        };

        /**
        * Changes the value of the article's commenting setting and updates
        * it on the server.
        *
        * @method changeCommentingSetting
        * @param newValue {Number} New value of the article commenting
        *   setting. Should be one of the values from article.commenting
        *   object.
        * @return {Object} promise object.
        */
        Article.prototype.changeCommentingSetting = function (newValue) {
            var deferred = $q.defer(),
                postData = {
                    article: {}
                },
                self = this,
                url;

            url = Routing.generate(
                'newscoop_gimme_articles_patcharticle',
                {number: self.articleId, language: self.language},
                true
            );

            postData.article = {
                comments_enabled: (newValue === Article.commenting.ENABLED) ?
                1 : 0,
                comments_locked: (newValue === Article.commenting.LOCKED) ?
                1 : 0
            };
            postData.article.name = self.title;

            $http.patch(
                url, postData, {transformRequest: transform.formEncode}
            ).success(function () {
                deferred.resolve();
            }).error(function (responseBody) {
                deferred.reject(responseBody);
            });

            return deferred.promise;
        };

        /**
        * Updates article's workflow status on the server.
        *
        * @method setWorkflowStatus
        * @param status {String} article's new workflow status
        * @return {Object} the underlying $http object's promise
        */
        Article.prototype.setWorkflowStatus = function (status) {
            var url = Routing.generate(
                'newscoop_gimme_articles_changearticlestatus',
                {
                    number: this.articleId,
                    language: this.language,
                    status: status
                },
                true
            );

            return $http.patch(url);
        };

        /**
        * Removes the lock on article.
        *
        * @method releaseLock
        * @return {Object} promise object
        */
        Article.prototype.releaseLock = function () {
            var deferred = $q.defer(),
                self = this,
                url;

            url = Routing.generate(
                'newscoop_gimme_articles_changearticlelockstatus',
                {
                    number: this.articleId,
                    language: this.language
                },
                true
            );

            // helper function for handling "success" to avoid code duplication
            function onSuccess() {
                self.isLocked = false;
                deferred.resolve();
            }

            $http.delete(url)
            .success(onSuccess)
            .error(function (data, status) {
                // Status 403 means that article is already unlocked, which we
                // do not interpret as an error - we know that the lock is now
                // lifted which is exactly what we wanted to achieve.
                if (status === 403) {
                    onSuccess();
                } else {
                    deferred.reject(data);
                }
            });

            return deferred.promise;
        };

        /**
        * Sets a new order of related articles
        *
        * @method setOrderOfRelatedArticles
        * @param relatedArticle {Object} article
        * @param index {Integer} position in list
        */
        Article.prototype.setOrderOfRelatedArticles =
        function (relatedArticle, index) {
            var self = this,
                defered = $q.defer(),
                linkHeader = [];

            linkHeader = [
                '<' +
                Routing.generate(
                    'newscoop_gimme_articles_getarticle',
                    {number: relatedArticle.articleId},
                    false
                ) +
                '; rel="article">,' +
                '<' +
                (index + 1) +
                '; rel="article-position">'
            ].join('');

            $http({
                url: Routing.generate(
                    'newscoop_gimme_articles_linkarticle',
                    {number: self.articleId, language: self.language},
                    true
                ),
                method: 'LINK',
                headers: {link: linkHeader}
            })
            .success(function () {
                defered.resolve();
                toaster.add({
                    type: 'sf-info',
                    message: TranslationService.trans(
                        'aes.msgs.relatedarticles.order.success'
                    )
                });
            })
            .error(function (responseBody) {
                defered.reject(responseBody);
                toaster.add({
                    type: 'sf-info',
                    message: TranslationService.trans(
                        'aes.msgs.relatedarticles.order.success'
                    )
                });
            });

            return defered.promise;
        };

        return Article;
    }

]);
