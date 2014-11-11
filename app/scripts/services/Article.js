'use strict';

/**
* A factory which creates article model.
*
* @class Article
*/
angular.module('authoringEnvironmentApp').factory('Article', [
    '$http',
    '$q',
    function ($http, $q) {
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
            if (text === null) {
                return text;
            }
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
                var output = '<div class="snippet" data-id="';
                output += parseInt(id);
                output += '"></div>';
                return output;
            });
            return converted;
        }

        /**
        * Finds images placeholders in text and converts them to
        * images HTML (thiscan be later converted to Aloha blocks).
        *
        * An example of such placeholder:
        *     <** Image 1234 float="left" size="small" **>
        *
        * @function imageCommentsToDivs
        * @param text {String} text to convert
        * @return {String} converted text
        */
        function imageCommentsToDivs(text) {
            if (text === null) {
                return text;
            }
            // the extra backslash (\) is because of Javascript being picky
            var imageReg  = '<';         // exact match
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
            imageReg     += '\\*\\*';      // exact match on **
            imageReg     += '>';           // exact match
            var imagePattern = new RegExp(imageReg, 'ig');

            var converted = text.replace(
                imagePattern,
                function(whole, imageId, imageAttributes) {
                    var imageDiv = '<div class="image" dropped-image ' +
                        'data-id="' + imageId + '"';
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
        * @param type {String} the type of Aloha blocks to search for and
        *   convert ('snippet' or 'image')
        * @param text {String} text to convert
        * @return {String} converted text
        */
        function serializeAlohaBlocks(type, text) {
            var content,
                matches,
                sep;

            if ((type !== 'snippet' && type !== 'image') || text === null) {
                return text;
            }

            sep = {snippet: '--', image: '**'};
            content = $('<div/>').html(text);

            matches = content.contents().filter('div.' + type);

            // replace each matching div with its serialized version
            matches.replaceWith(function() {
                var serialized,
                    $match = $(this);

                serialized = [
                    '<', sep[type], ' ',
                    type.charAt(0).toUpperCase(), type.slice(1), ' ',
                    parseInt($match.data('id'), 10)
                ];

                $.each($match.data(), function (name, value) {
                    if (name !== 'id') {
                        serialized.push(' ', name, '="', value, '"');
                    }
                });

                serialized.push(' ', sep[type], '>');
                return serialized.join('');
            });

            return content.html()
                .replace(/\&lt\;\*\*/g,'<**')   // replace &lt;** with <**
                .replace(/\*\*\&gt\;/g, '**>')  // replace **&gt; with **>
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
                self.fields[key] = deserializeAlohaBlocks(self.fields[key]);
            });

            self.comments_locked = !!parseInt(self.comments_locked);
            self.comments_enabled = !!parseInt(self.comments_enabled);
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

        /**
        * Saves all changes in article content to the server.
        *
        * @method save
        * @return {Object} promise object.
        */
        Article.prototype.save = function () {
            var deferred = $q.defer(),
                postData,
                self = this,
                url;

            url = Routing.generate(
                // XXX: should be the patcharticle path, but there is a bug in
                // Routing object, thus we use another path that gives us the
                // same result
                'newscoop_gimme_articles_linkarticle',
                {number: self.articleId, language: self.language},
                true
            );

            postData = angular.copy(self);

            // serialize objects (images, snippets) in all article fields
            Object.keys(postData.fields).forEach(function (key) {
                var serialized = serializeAlohaBlocks(
                    'image', postData.fields[key]
                );
                postData.fields[key] = serializeAlohaBlocks(
                    'snippet', serialized
                );
            });

            $http.patch(
                url, postData
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
        // XXX: get rid of explicitly passing switchNames
        Article.prototype.saveSwitches = function (switchNames) {
            var deferred = $q.defer(),
                postData,
                self = this,
                url;

            url = Routing.generate(
                // XXX: should be the patcharticle path, but there is a bug in
                // Routing object, thus we use another path that gives us the
                // same result
                'newscoop_gimme_articles_linkarticle',
                {number: self.articleId, language: self.language},
                true
            );

            postData = {
                fields: {}
            };
            switchNames.forEach(function (name) {
                postData.fields[name] = self.fields[name];
            });

            $http.patch(
                url, postData
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
                postData,
                url;

            url = Routing.generate(
                'newscoop_gimme_articles_patcharticle',
                {number: this.articleId, language: this.language},
                true
            );

            postData = {
                comments_enabled: (newValue === Article.commenting.ENABLED),
                comments_locked: (newValue === Article.commenting.LOCKED)
            };

            $http.patch(
                url, postData
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

        return Article;
    }
]);
